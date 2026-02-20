import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Standalone Vite config for running the renderer in a browser
 * (without Electron). Use: npx vite --config vite.renderer.config.mts
 */
export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname!, 'src')
    }
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api/oauth/token': {
        target: 'https://console.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/oauth/token', '/v1/oauth/token'),
      }
    }
  }
})
