import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import build from '@hono/vite-build'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx', // The file path of your application.
    }),
    build({
      entry: 'src/index.tsx',
      outDir: 'dist',
      external: []
    })
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  }
})
