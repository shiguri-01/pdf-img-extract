use std::sync::Arc;

use hayro_interpret::{
    Context, Device, Image, InterpreterSettings, LumaData, RgbData, interpret_page,
};
use hayro_syntax::Pdf;
use image::{DynamicImage, ImageBuffer, Luma, imageops::FilterType};
use kurbo::{Affine, BezPath, Rect};
use thiserror::Error;

#[derive(Debug)]
pub struct ExtractedImage {
    pub page_index: usize,
    pub image: DynamicImage,
}

#[derive(Debug)]
pub struct ExtractImagesResult {
    pub images: Vec<ExtractedImage>,
    pub errors: Vec<ExtractImageWarning>,
}

#[derive(Debug, Error)]
pub enum ExtractError {
    #[error("failed to parse pdf: {0}")]
    PdfParse(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum ExtractImageWarningKind {
    #[error("alpha image buffer shape is invalid")]
    InvalidAlphaBufferShape,
    #[error("rgb image buffer shape is invalid")]
    InvalidRgbBufferShape,
    #[error("rgba image buffer shape is invalid")]
    InvalidRgbaBufferShape,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExtractImageWarning {
    pub page_index: usize,
    pub kind: ExtractImageWarningKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PageRange {
    pub start: usize,
    pub end: usize,
}

pub fn extract_images(
    pdf_bytes: &[u8],
    page_ranges: &[PageRange],
) -> Result<ExtractImagesResult, ExtractError> {
    let pdf = Pdf::new(Arc::new(pdf_bytes.to_vec()))
        .map_err(|err| ExtractError::PdfParse(format!("{err:?}")))?;
    let mut extractor = ImageExtractor::new();

    let pages = pdf.pages();
    let total = pages.len();
    let selected_pages = select_pages(total, page_ranges);

    for (i, page) in pages.iter().enumerate() {
        if !selected_pages[i] {
            continue;
        }
        extractor.set_current_page_index(i);

        // ダミーのbboxを使用
        let mut context = Context::new(
            Affine::IDENTITY,
            Rect::new(0.0, 0.0, 1.0, 1.0),
            pdf.xref(),
            InterpreterSettings::default(),
        );

        interpret_page(page, &mut context, &mut extractor);
    }

    Ok(ExtractImagesResult {
        images: extractor.images,
        errors: extractor.warnings,
    })
}

fn select_pages(total: usize, page_ranges: &[PageRange]) -> Vec<bool> {
    if total == 0 {
        return vec![];
    }
    if page_ranges.is_empty() {
        return vec![true; total];
    }

    let mut selected = vec![false; total];
    for page_range in page_ranges {
        let Some((start, end)) = normalize_page_range(page_range, total) else {
            continue;
        };
        for is_selected in selected.iter_mut().take(end + 1).skip(start) {
            *is_selected = true;
        }
    }
    selected
}

fn normalize_page_range(page_range: &PageRange, total: usize) -> Option<(usize, usize)> {
    if total == 0 {
        return None;
    }
    if page_range.start > page_range.end {
        return None;
    }
    if page_range.start >= total {
        return None;
    }

    let start = page_range.start;
    let end = page_range.end.min(total - 1);

    Some((start, end))
}

struct ImageExtractor {
    images: Vec<ExtractedImage>,
    warnings: Vec<ExtractImageWarning>,
    current_page_index: usize,
}

impl ImageExtractor {
    fn new() -> Self {
        ImageExtractor {
            images: Vec::new(),
            warnings: Vec::new(),
            current_page_index: 0,
        }
    }

    fn set_current_page_index(&mut self, page_index: usize) {
        self.current_page_index = page_index;
    }

    fn raster_to_dynamic_image(
        &self,
        rgb: &RgbData,
        alpha: Option<&LumaData>,
    ) -> Result<DynamicImage, ExtractImageWarningKind> {
        match alpha {
            Some(alpha) => {
                let expected_pixels = validate_rgb_shape(rgb.width, rgb.height, rgb.data.len())?;

                let alpha_data: Vec<u8> = if alpha.width == rgb.width && alpha.height == rgb.height
                {
                    alpha.data.clone()
                } else {
                    let alpha_buf: ImageBuffer<Luma<u8>, Vec<u8>> =
                        ImageBuffer::from_raw(alpha.width, alpha.height, alpha.data.clone())
                            .ok_or(ExtractImageWarningKind::InvalidAlphaBufferShape)?;

                    let resized_alpha = image::imageops::resize(
                        &alpha_buf,
                        rgb.width,
                        rgb.height,
                        FilterType::Triangle,
                    );
                    resized_alpha.into_raw()
                };

                validate_alpha_shape(expected_pixels, alpha_data.len())?;

                let mut interleaved = Vec::with_capacity(rgb.data.len() / 3 * 4);
                let mut rgb_chunks = rgb.data.chunks_exact(3);
                if !rgb_chunks.remainder().is_empty() {
                    return Err(ExtractImageWarningKind::InvalidRgbBufferShape);
                }
                for (pixel, &a) in rgb_chunks.by_ref().zip(alpha_data.iter()) {
                    interleaved.extend_from_slice(&[pixel[0], pixel[1], pixel[2], a]);
                }

                Ok(DynamicImage::ImageRgba8(
                    ImageBuffer::from_raw(rgb.width, rgb.height, interleaved)
                        .ok_or(ExtractImageWarningKind::InvalidRgbaBufferShape)?,
                ))
            }
            None => {
                validate_rgb_shape(rgb.width, rgb.height, rgb.data.len())?;
                Ok(DynamicImage::ImageRgb8(
                    ImageBuffer::from_raw(rgb.width, rgb.height, rgb.data.clone())
                        .ok_or(ExtractImageWarningKind::InvalidRgbBufferShape)?,
                ))
            }
        }
    }
}

fn validate_rgb_shape(
    width: u32,
    height: u32,
    rgb_len: usize,
) -> Result<usize, ExtractImageWarningKind> {
    let pixels = expected_pixel_count(width, height)
        .ok_or(ExtractImageWarningKind::InvalidRgbBufferShape)?;
    let expected_rgb_len = pixels
        .checked_mul(3)
        .ok_or(ExtractImageWarningKind::InvalidRgbBufferShape)?;
    if rgb_len != expected_rgb_len {
        return Err(ExtractImageWarningKind::InvalidRgbBufferShape);
    }
    Ok(pixels)
}

fn validate_alpha_shape(
    expected_pixels: usize,
    alpha_len: usize,
) -> Result<(), ExtractImageWarningKind> {
    if alpha_len != expected_pixels {
        return Err(ExtractImageWarningKind::InvalidAlphaBufferShape);
    }
    Ok(())
}

fn expected_pixel_count(width: u32, height: u32) -> Option<usize> {
    (width as usize).checked_mul(height as usize)
}

// 画像の抽出に必要なdraw_imageのみ実装
impl Device<'_> for ImageExtractor {
    fn set_soft_mask(&mut self, _mask: Option<hayro_interpret::SoftMask<'_>>) {}

    fn set_blend_mode(&mut self, _blend_mode: hayro_interpret::BlendMode) {}

    fn draw_path(
        &mut self,
        _path: &BezPath,
        _transform: Affine,
        _paint: &hayro_interpret::Paint<'_>,
        _draw_mode: &hayro_interpret::PathDrawMode,
    ) {
    }

    fn push_clip_path(&mut self, _clip_path: &hayro_interpret::ClipPath) {}

    fn push_transparency_group(
        &mut self,
        _opacity: f32,
        _mask: Option<hayro_interpret::SoftMask<'_>>,
        _blend_mode: hayro_interpret::BlendMode,
    ) {
    }

    fn draw_glyph(
        &mut self,
        _glyph: &hayro_interpret::font::Glyph<'_>,
        _transform: Affine,
        _glyph_transform: Affine,
        _paint: &hayro_interpret::Paint<'_>,
        _draw_mode: &hayro_interpret::GlyphDrawMode,
    ) {
    }

    fn draw_image(&mut self, image: Image<'_, '_>, _: Affine) {
        if let Image::Raster(raster) = image {
            raster.with_rgba(
                |rgb, alpha| match self.raster_to_dynamic_image(&rgb, alpha.as_ref()) {
                    Ok(image) => self.images.push(ExtractedImage {
                        page_index: self.current_page_index,
                        image,
                    }),
                    Err(kind) => self.warnings.push(ExtractImageWarning {
                        page_index: self.current_page_index,
                        kind,
                    }),
                },
                None,
            );
        }
    }

    fn pop_clip_path(&mut self) {}

    fn pop_transparency_group(&mut self) {}
}

#[cfg(test)]
mod tests {
    use super::{
        ExtractImageWarningKind, PageRange, normalize_page_range, select_pages,
        validate_alpha_shape, validate_rgb_shape,
    };

    #[test]
    fn normalize_keeps_valid_range() {
        assert_eq!(
            normalize_page_range(&PageRange { start: 1, end: 3 }, 10),
            Some((1, 3))
        );
    }

    #[test]
    fn normalize_clamps_end() {
        assert_eq!(
            normalize_page_range(&PageRange { start: 2, end: 20 }, 10),
            Some((2, 9))
        );
    }

    #[test]
    fn normalize_invalid_range_returns_none() {
        assert_eq!(
            normalize_page_range(&PageRange { start: 3, end: 2 }, 10),
            None
        );
    }

    #[test]
    fn normalize_out_of_bounds_start_returns_none() {
        assert_eq!(
            normalize_page_range(&PageRange { start: 10, end: 12 }, 10),
            None
        );
    }

    #[test]
    fn normalize_empty_document_returns_none() {
        assert_eq!(
            normalize_page_range(&PageRange { start: 0, end: 0 }, 0),
            None
        );
    }

    #[test]
    fn select_pages_empty_range_uses_all_pages() {
        assert_eq!(select_pages(5, &[]), vec![true, true, true, true, true]);
    }

    #[test]
    fn select_pages_ignores_invalid_ranges() {
        assert_eq!(
            select_pages(
                5,
                &[
                    PageRange { start: 10, end: 12 },
                    PageRange { start: 3, end: 1 }
                ]
            ),
            vec![false, false, false, false, false]
        );
    }

    #[test]
    fn select_pages_deduplicates_overlapping_ranges() {
        assert_eq!(
            select_pages(
                6,
                &[
                    PageRange { start: 1, end: 3 },
                    PageRange { start: 2, end: 5 }
                ]
            ),
            vec![false, true, true, true, true, true]
        );
    }

    #[test]
    fn validate_rgb_shape_rejects_invalid_len() {
        assert_eq!(
            validate_rgb_shape(2, 1, 5),
            Err(ExtractImageWarningKind::InvalidRgbBufferShape)
        );
    }

    #[test]
    fn validate_alpha_shape_rejects_invalid_len() {
        assert_eq!(
            validate_alpha_shape(2, 1),
            Err(ExtractImageWarningKind::InvalidAlphaBufferShape)
        );
    }
}
