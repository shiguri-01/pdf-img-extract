import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [solid(), tailwindcss(), wasm(), tsconfigPaths()],
  worker: {
    plugins: () => [wasm(), tsconfigPaths()],
  },
});
