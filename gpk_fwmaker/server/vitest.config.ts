import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
      ],
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    maxConcurrency: 1, // Run tests sequentially to avoid port conflicts
    fileParallelism: false, // Disable file parallelism
  },
})