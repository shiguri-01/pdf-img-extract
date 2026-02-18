# web

A SolidJS app that extracts PDF images in the browser using `extract-wasm`.

## Requirements

- Node.js
- `pnpm`
- `wasm/pkg` must be generated in advance (`just build-wasm`)

## Setup

```bash
pnpm --dir web install --frozen-lockfile
```

## Development

```bash
pnpm --dir web dev
```

## Build

```bash
pnpm --dir web build
```

To run from the repository root:

```bash
just build-web
```

## Quality Checks

- `pnpm --dir web lint`
- `pnpm --dir web exec tsc -b`
- `pnpm --dir web fmt`

Use `just check` from the root for full repository validation.

## Implementation Notes

- Extraction runs in a Web Worker at `src/extract/worker.ts`
- The worker initializes `extract-wasm` and performs extraction
- Images are handled as PNG byte arrays and can be downloaded as a ZIP from the UI
