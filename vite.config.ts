import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx',
      adapter, // Cloudflare Adapter
    }),
  ],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    ssr: true, // Enable SSR mode for proper bundling
    rollupOptions: {
      input: 'src/index.tsx', // Explicit input entry
      external: [], // Bundle all dependencies - explicitly empty array
      output: {
        format: 'es',
        entryFileNames: '_worker.js',
        dir: 'dist'
      }
    }
  }
})
