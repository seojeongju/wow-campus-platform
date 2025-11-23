import { defineConfig } from 'vite'

export default defineConfig({
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
