# extract-wasm

WASM bindings that expose the `extract` crate to web runtimes.

## Exported Function

```ts
extractImages(pdfBytes: Uint8Array, ranges?: { start: number; end: number }[]): {
  images: { pageIndex: number; pngBytes: Uint8Array }[];
  errors: { pageIndex: number; kind: string; message: string }[];
}
```

- `ranges` uses 0-based indexes
- `pngBytes` contains PNG-encoded bytes
- On failure, a JavaScript exception is thrown

## Build

```bash
wasm-pack build wasm --target web --release
```

Or from the repository root:

```bash
just build-wasm
```

## Web Integration

In this repository, `web/package.json` references `file:../wasm/pkg`.  
Generate `wasm/pkg` before building or running `web`.
