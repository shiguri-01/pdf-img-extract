# extract

A Rust library for extracting raster images from PDFs.

## Responsibilities

- Parse PDFs and scan images on each page
- Return extracted images as `image::DynamicImage`
- Collect non-fatal issues as warnings during extraction

## Public API

```rust
pub fn extract_images(
    pdf_bytes: &[u8],
    page_ranges: &[PageRange],
) -> Result<ExtractImagesResult, ExtractError>
```

- `pdf_bytes`: PDF bytes
- `page_ranges`: 0-based page ranges (all pages when empty)
- Return value:
- `images`: Extracted images with page index
- `errors`: Per-page warnings

## Types

- `PageRange { start, end }`: 0-based, inclusive `start..=end`
- `ExtractedImage { page_index, image }`
- `ExtractImageWarning { page_index, kind }`
- `ExtractError::PdfParse`: PDF parse failure

## Example

```rust
use extract::{extract_images, PageRange};

let pdf_bytes = std::fs::read("sample.pdf")?;
let ranges = vec![PageRange { start: 0, end: 2 }]; // pages 1-3
let result = extract_images(&pdf_bytes, &ranges)?;

println!("images: {}", result.images.len());
println!("warnings: {}", result.errors.len());
# Ok::<(), Box<dyn std::error::Error>>(())
```
