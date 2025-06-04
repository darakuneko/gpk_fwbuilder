import app from '../../src/app'
import { Server } from 'http'

let server: Server | null = null
export const TEST_PORT = 3001

export async function startTestServer(): Promise<void> {
  // If server is already running, don't start another one
  if (server) {
    console.log(`Test server already running on port ${TEST_PORT}`)
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}`)
      resolve()
    })

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${TEST_PORT} is already in use. Using random port.`)
        // Try with port 0 to get a random available port
        server = app.listen(0, () => {
          const address = server?.address()
          const actualPort = typeof address === 'object' && address ? address.port : 'unknown'
          console.log(`Test server running on random port ${actualPort}`)
          resolve()
        })
      } else {
        console.error('Test server startup failed:', error)
        reject(error)
      }
    })
  })
}

export async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server stopped')
        server = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}