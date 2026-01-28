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
      entry: resolve(__dirname, 'src/index.tsx'),
      output: '_worker.js',
      outputDir: resolve(__dirname, 'dist'),
      external: [], // Bundle all dependencies
      minify: true,
      emptyOutDir: true
    })
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  }
})
