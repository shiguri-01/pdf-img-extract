use std::io::Cursor;

use extract::{self, ExtractImageWarningKind};
use image::{DynamicImage, ImageFormat};
use js_sys::{Array, Error as JsError, Object, Reflect, Uint8Array};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = extractImages)]
pub fn extract_images(pdf_bytes: &[u8], ranges: Option<Array>) -> Result<JsValue, JsValue> {
    let page_ranges = parse_page_ranges(ranges)?;
    let result = extract::extract_images(pdf_bytes, &page_ranges)
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

fn parse_page_ranges(ranges: Option<Array>) -> Result<Vec<extract::PageRange>, JsValue> {
    let Some(ranges) = ranges else {
        return Ok(vec![]);
    };

    let mut parsed = Vec::with_capacity(ranges.length() as usize);
    for (index, item) in ranges.iter().enumerate() {
        if !item.is_object() {
            return Err(js_error(&format!(
                "range at index {index} must be an object"
            )));
        }
        let start = Reflect::get(&item, &JsValue::from_str("start"))
            .map_err(|_| js_error(&format!("range at index {index} is missing start")))?;
        let end = Reflect::get(&item, &JsValue::from_str("end"))
            .map_err(|_| js_error(&format!("range at index {index} is missing end")))?;

        let start = parse_non_negative_index(&start, "start", index)?;
        let end = parse_non_negative_index(&end, "end", index)?;

        parsed.push(extract::PageRange { start, end });
    }
    Ok(parsed)
}

fn parse_non_negative_index(
    value: &JsValue,
    field: &str,
    range_index: usize,
) -> Result<usize, JsValue> {
    let Some(num) = value.as_f64() else {
        return Err(js_error(&format!(
            "{field} at index {range_index} must be a number"
        )));
    };
    if num.is_sign_negative() || num.fract() != 0.0 {
        return Err(js_error(&format!(
            "{field} at index {range_index} must be a non-negative integer"
        )));
    }
    Ok(num as usize)
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
    use super::warning_kind_code;
    use extract::ExtractImageWarningKind;

    #[test]
    fn warning_kind_code_is_stable() {
        assert_eq!(
            warning_kind_code(&ExtractImageWarningKind::InvalidRgbBufferShape),
            "invalid_rgb_buffer_shape"
        );
    }
}
