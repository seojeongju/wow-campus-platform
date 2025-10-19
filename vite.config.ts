import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

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
  },
  plugins: [
    {
      name: 'copy-public-files',
      closeBundle() {
        // Copy public files to dist after build
        const publicDir = 'public'
        const distDir = 'dist'
        
        // Create static directory if it doesn't exist
        const staticDir = join(distDir, 'static')
        if (!existsSync(staticDir)) {
          mkdirSync(staticDir, { recursive: true })
        }
        
        // Copy static files
        try {
          copyFileSync(join(publicDir, 'static', 'app.js'), join(staticDir, 'app.js'))
          copyFileSync(join(publicDir, 'static', 'style.css'), join(staticDir, 'style.css'))
          console.log('✅ Public files copied to dist/')
        } catch (error) {
          console.error('❌ Error copying public files:', error)
        }
      }
    }
  ]
})
