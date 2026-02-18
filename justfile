build-wasm:
  wasm-pack build wasm --target web --release

build-web:
  pnpm --dir web install --frozen-lockfile
  pnpm --dir web build

check:
  cargo clippy --workspace --all-targets -- -D warnings
  cargo test --workspace
  pnpm --dir web lint
  pnpm --dir web exec tsc -b
  cargo fmt --all -- --check
  pnpm --dir web exec oxfmt --check

@fmt:
  cargo fmt --all
  pnpm --dir web fmt
