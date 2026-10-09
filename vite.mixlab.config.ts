import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Lean Mix Lab-only build — same MixDesigner source as Arcos, no Arcos/PDF chunks. */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-mixlab",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: {
        mixlab: resolve(__dirname, "mixlab.html"),
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
