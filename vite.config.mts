/**
 * Standalone Vite config for browser mode (dev:web).
 * Same renderer config as electron.vite.config.ts but with proxy rules
 * and no rachProjectApi plugin (the Express backend handles it).
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [react(), tailwindcss()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  server: {
    port: 5175,
    proxy: {
      // Rach backend server
      '/rach-api': {
        target: 'http://localhost:3062',
        changeOrigin: true,
      },
      '/rach-ws': {
        target: 'ws://localhost:3062',
        ws: true,
      },
      // Ravel agent server
      '/api': {
        target: 'http://localhost:3061',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3061',
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
    },
  },
})
