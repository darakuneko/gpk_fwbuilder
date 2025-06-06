import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { UserConfig } from 'vite';

const config: UserConfig = defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true
    }),
    electron([
      {
        entry: 'index.ts',
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                'electron-store',
                'dotenv',
                'axios',
                'form-data',
                'ansi-to-html',
                'html-react-parser'
              ]
            }
          }
        }
      },
      {
        entry: 'preload.ts',
        onstart(options): void {
          options.reload();
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            lib: {
              entry: 'preload.ts',
              formats: ['cjs'],
              fileName: (): string => 'preload.js'
            },
            rollupOptions: {
              external: [
                'electron'
              ],
              output: {
                format: 'cjs'
              }
            }
          }
        }
      }
    ])
  ],
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: []
  },
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});

export default config;