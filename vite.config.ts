import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import devServer from '@hono/vite-dev-server'
import build from '@hono/vite-build/cloudflare-pages'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx', // The file path of your application.
    }),
    build({
      entry: './src/index.tsx',
      output: '_worker.js',
      outputDir: './dist',
      external: [], // Bundle all dependencies
      minify: true,
      emptyOutDir: true
    })
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
    copyPublicDir: true
  }
})
