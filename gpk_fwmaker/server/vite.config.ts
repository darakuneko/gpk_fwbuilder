import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/app.ts'),
      name: 'GPKFWMaker',
      fileName: 'app',
      formats: ['cjs']
    },
    rollupOptions: {
      external: [
        'express',
        'body-parser',
        'multer',
        'child_process',
        'fs',
        'path',
        'util'
      ],
      output: {
        format: 'cjs',
        entryFileNames: 'app.js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})