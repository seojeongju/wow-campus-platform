import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import devServer from '@hono/vite-dev-server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx', // The file path of your application.
    }),
  ],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: () => '_worker.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      external: [],
      input: 'src/index.tsx'
    }
  }
})
