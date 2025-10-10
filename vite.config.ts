import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx',
      injectClientScript: false // Disable automatic client script injection
    })
  ],
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5173,
    strictPort: true,
    allowedHosts: ['localhost', '.e2b.dev', 'all'] // Allow all hosts including e2b.dev
  },
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
