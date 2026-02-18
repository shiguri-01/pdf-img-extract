# Repository Guidelines

## Project Structure & Module Organization
- `extract/`: Core Rust library for PDF image extraction logic.
- `wasm/`: Rust crate compiled to WebAssembly and consumed by the web app.
- `cli/`: Command-line app (`pdf-img-extract`) for local PDF image extraction.
- `web/`: SolidJS + Vite frontend (`src/components`, `src/extract`, `src/*.ts(x)`).
- `target/`: Rust build artifacts (generated).
- Root files: `Cargo.toml` (workspace), `justfile` (common tasks), `Cargo.lock`, `README.md`, `AGENTS.md`.
- Module docs: `extract/README.md`, `wasm/README.md`, `cli/README.md`, `web/README.md`.

Keep extraction logic in Rust crates and UI/state concerns in `web/src`.

## Build, Test, and Development Commands
- `just build-wasm`: Build the WASM package via `wasm-pack` (`wasm/pkg` output).
- `just build-web`: Build frontend production assets from `web/`.
- `just build-cli`: Build the CLI binary (`pdf-img-extract-cli`).
- `just check`: Full CI-style verification:
  - `cargo clippy --workspace --all-targets -- -D warnings`
  - `cargo test --workspace`
  - `pnpm --dir web lint`
  - `pnpm --dir web exec tsc -b`
  - `cargo fmt --all -- --check`
  - `pnpm --dir web exec oxfmt --check`
- `just fmt`: Format Rust and frontend code.
- `pnpm --dir web dev`: Run local frontend dev server.

## Coding Style & Naming Conventions
- Rust: `cargo fmt` formatting, Clippy clean with warnings denied.
- TypeScript/Solid: `oxfmt` formatting and `oxlint` linting.
- Indentation: follow formatter defaults (do not hand-format).
- Naming:
  - Rust functions/modules: `snake_case`
  - TypeScript variables/functions: `camelCase`
  - Solid components/files: `PascalCase` (for component files in `web/src/components`).

## Testing Guidelines
- Rust tests live with crates and run via `cargo test --workspace`.
- Frontend currently relies on lint + type checks (`oxlint`, `tsc -b`) rather than a dedicated test runner.
- Before opening a PR, run `just check` and ensure no warnings or formatting diffs remain.

## Commit & Pull Request Guidelines
- Prefer Conventional Commit style seen in history, e.g. `feat: add page range validation`.
- Keep commits focused and atomic (Rust core, WASM bridge, and UI changes split when possible).
- PRs should include:
  - Clear summary of behavior changes
  - Linked issue/task (if available)
  - Validation notes (`just check` output summary)
  - UI screenshots/GIFs for frontend changes
