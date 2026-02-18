# pdf-img-extract-cli

A CLI that extracts embedded PDF images and saves them as PNG files.

## Run

```bash
cargo run -p pdf-img-extract-cli -- <input.pdf>
```

Example:

```bash
cargo run -p pdf-img-extract-cli -- ./sample.pdf
```

## Options

- `-o, --output <DIR>`: Output directory (default: `<input_basename>-images`)
- `-p, --pages <RANGES>`: Page ranges to extract (1-based)

`--pages` examples:

- `1`
- `1,3-5`
- `5-3` (normalized automatically)
- `0` (treated as the first page)

## Output File Name

Each image is saved with this naming pattern:

```text
page-<page>-image-<index>.png
```

Example: `page-3-image-2.png`

## Build

```bash
cargo build -p pdf-img-extract-cli
```

Or from the repository root:

```bash
just build-cli
```
