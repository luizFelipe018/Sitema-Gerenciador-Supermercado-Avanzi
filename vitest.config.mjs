import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globalSetup: './src/__tests__/globalSetup.mjs',
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 15000
  }
})
