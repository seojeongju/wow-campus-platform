import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { cwd } from 'process'
import devServer from '@hono/vite-dev-server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get entry path - use process.cwd() for CI, __dirname for local
const getEntryPath = () => {
  try {
    // Try process.cwd() first (works in CI environments)
    const baseDir = typeof process !== 'undefined' && process.cwd ? cwd() : __dirname
    return resolve(baseDir, 'src/index.tsx')
  } catch {
    // Fallback to relative path
    return 'src/index.tsx'
  }
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
