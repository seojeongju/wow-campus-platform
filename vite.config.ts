import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: () => '_worker.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: []
    }
  }
})
