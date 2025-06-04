import { beforeAll, afterAll } from 'vitest'

beforeAll(async () => {
  // SuperTest doesn't require actual server startup
  // It handles the app instance directly
  console.log('Test environment initialized')
})

afterAll(async () => {
  console.log('Test environment cleaned up')
})