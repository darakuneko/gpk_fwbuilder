import { describe, it, expect } from 'vitest'
import { APITestClient } from '../helpers/test-client'

describe('Simple API Endpoints', () => {
  it('should return welcome message', async () => {
    const response = await APITestClient.get('/')
    
    expect(response.status).toBe(200)
    expect(response.text).toBe('GPK FWMaker!')
  })

  it('should return 404 for unknown endpoints', async () => {
    const response = await APITestClient.get('/nonexistent-endpoint')
    
    expect(response.status).toBe(404)
  })

  it('should handle POST requests to root path', async () => {
    const response = await APITestClient.post('/', {})
    
    // Should return 404 as POST is not supported on root
    expect(response.status).toBe(404)
  })
})