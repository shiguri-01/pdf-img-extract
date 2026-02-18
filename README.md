# pdf-img-extract

A Rust workspace for extracting embedded images from PDFs.  
It provides a core extraction library (Rust), plus CLI, WASM, and Web UI layers.

## Structure

- `extract/`: Core Rust library for PDF image extraction
- `wasm/`: WASM bindings that expose `extract` to the web
- `cli/`: Command-line interface for extraction
- `web/`: SolidJS + Vite frontend

## Requirements

- Rust (stable)
- `wasm-pack`
- `pnpm`
- `just` (optional, for running tasks in `justfile`)

## Quick Start

1. Build WASM

```bash
just build-wasm
```

2. Start the web dev server

```bash
pnpm --dir web install
pnpm --dir web dev
```

3. Run the CLI

```bash
cargo run -p pdf-img-extract-cli -- ./sample.pdf
```

## Main Commands

- `just build-wasm`: `wasm-pack build wasm --target web --release`
- `just build-web`: Build production assets for `web/`
- `just build-cli`: Build the CLI binary
- `just check`: Clippy / Rust test / Web lint / TypeScript build / format check
- `just fmt`: Format Rust and web code

## Page Range Syntax

- Page ranges are 1-based in CLI and web input
- Use comma-separated ranges such as `1,3-5`
- Descending ranges like `5-3` are normalized automatically
- `0` is treated as the first page

## Module READMEs

- `extract/README.md`
- `wasm/README.md`
- `cli/README.md`
- `web/README.md`
