import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [solid(), tailwindcss(), wasm(), tsconfigPaths()],
  worker: {
    plugins: () => [wasm(), tsconfigPaths()],
  },
});
