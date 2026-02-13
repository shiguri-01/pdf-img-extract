use std::io::Cursor;

use extract::{self, ExtractImageWarningKind};
use image::{DynamicImage, ImageFormat};
use js_sys::{Array, Error as JsError, Object, Reflect, Uint8Array};
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum PageRangeArg {
    All,
    From(usize),
    ToInclusive(usize),
    Inclusive(usize, usize),
}

#[wasm_bindgen(js_name = extractImages)]
pub fn extract_images(
    pdf_bytes: &[u8],
    start: Option<u32>,
    end: Option<u32>,
) -> Result<JsValue, JsValue> {
    let result = match page_range_from_options(start, end) {
        PageRangeArg::All => extract::extract_images(pdf_bytes, ..),
        PageRangeArg::From(s) => extract::extract_images(pdf_bytes, s..),
        PageRangeArg::ToInclusive(e) => extract::extract_images(pdf_bytes, ..=e),
        PageRangeArg::Inclusive(s, e) => extract::extract_images(pdf_bytes, s..=e),
    }
    .map_err(|err| js_error(&err.to_string()))?;

    let images = Array::new();
    for item in result.images {
        let image_obj = Object::new();
        let png_bytes = encode_png(&item.image).map_err(|err| js_error(&err))?;
        let png_array = Uint8Array::new_with_length(png_bytes.len() as u32);
        png_array.copy_from(&png_bytes);

        Reflect::set(
            &image_obj,
            &JsValue::from_str("pageIndex"),
            &JsValue::from_f64(item.page_index as f64),
        )?;
        Reflect::set(
            &image_obj,
            &JsValue::from_str("pngBytes"),
            &JsValue::from(png_array),
        )?;
        images.push(&image_obj);
    }

    let errors = Array::new();
    for warning in result.errors {
        let error_obj = Object::new();
        let kind = warning_kind_code(&warning.kind);
        let message = warning.kind.to_string();

        Reflect::set(
            &error_obj,
            &JsValue::from_str("pageIndex"),
            &JsValue::from_f64(warning.page_index as f64),
        )?;
        Reflect::set(
            &error_obj,
            &JsValue::from_str("kind"),
            &JsValue::from_str(kind),
        )?;
        Reflect::set(
            &error_obj,
            &JsValue::from_str("message"),
            &JsValue::from_str(&message),
        )?;
        errors.push(&error_obj);
    }

    let result_obj = Object::new();
    Reflect::set(&result_obj, &JsValue::from_str("images"), &images)?;
    Reflect::set(&result_obj, &JsValue::from_str("errors"), &errors)?;

    Ok(result_obj.into())
}

fn page_range_from_options(start: Option<u32>, end: Option<u32>) -> PageRangeArg {
    match (start, end) {
        (Some(s), Some(e)) => PageRangeArg::Inclusive(s as usize, e as usize),
        (Some(s), None) => PageRangeArg::From(s as usize),
        (None, Some(e)) => PageRangeArg::ToInclusive(e as usize),
        (None, None) => PageRangeArg::All,
    }
}

fn encode_png(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let mut cursor = Cursor::new(Vec::new());
    image
        .write_to(&mut cursor, ImageFormat::Png)
        .map_err(|err| format!("failed to encode PNG: {err}"))?;
    Ok(cursor.into_inner())
}

fn warning_kind_code(kind: &ExtractImageWarningKind) -> &'static str {
    match kind {
        ExtractImageWarningKind::InvalidAlphaBufferShape => "invalid_alpha_buffer_shape",
        ExtractImageWarningKind::InvalidRgbBufferShape => "invalid_rgb_buffer_shape",
        ExtractImageWarningKind::InvalidRgbaBufferShape => "invalid_rgba_buffer_shape",
    }
}

fn js_error(message: &str) -> JsValue {
    JsError::new(message).into()
}

#[cfg(test)]
mod tests {
    use super::{PageRangeArg, page_range_from_options, warning_kind_code};
    use extract::ExtractImageWarningKind;

    #[test]
    fn range_options_are_mapped_to_all() {
        assert_eq!(page_range_from_options(None, None), PageRangeArg::All);
    }

    #[test]
    fn range_options_are_mapped_to_inclusive() {
        assert_eq!(
            page_range_from_options(Some(2), Some(5)),
            PageRangeArg::Inclusive(2, 5)
        );
    }

    #[test]
    fn warning_kind_code_is_stable() {
        assert_eq!(
            warning_kind_code(&ExtractImageWarningKind::InvalidRgbBufferShape),
            "invalid_rgb_buffer_shape"
        );
    }
}
