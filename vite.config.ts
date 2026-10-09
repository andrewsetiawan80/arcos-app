import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/arcos-mobile/**'],
  },
  define: {
    // Polyfill for Buffer (needed by @react-pdf/renderer)
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Buffer polyfill for browser
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mixlab: resolve(__dirname, 'mixlab.html'),
      },
      // No manualChunks for react/react-pdf — splitting them creates broken shared graphs.
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lucide-react")) return "ui-vendor";
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})
