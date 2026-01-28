import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname, join } from 'path'
import { cwd } from 'process'
import devServer from '@hono/vite-dev-server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get entry path - works in both local and CI environments
const getEntryPath = () => {
  // Use process.cwd() for CI environments, __dirname for local
  const baseDir = typeof process !== 'undefined' && process.cwd ? process.cwd() : __dirname
  return resolve(baseDir, 'src/index.tsx')
}

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
      entry: getEntryPath(),
      formats: ['es'],
      fileName: () => '_worker.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      external: []
    }
  }
})
