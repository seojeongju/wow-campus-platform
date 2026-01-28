import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx', // The file path of your application.
    }),
  ],
  publicDir: 'public',
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
      external: []
    }
  }
})
