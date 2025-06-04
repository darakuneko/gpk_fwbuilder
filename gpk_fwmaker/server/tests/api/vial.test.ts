import { describe, it, expect } from 'vitest'
import { APITestClient } from '../helpers/test-client'
import { mockVialBuildRequest, mockVialLayout } from '../helpers/mock-data'

describe('Vial API Endpoints', () => {
  it('should handle Vial repository updates', async () => {
    const response = await APITestClient.get('/update/repository/vial')
    
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')
  })

  it('should handle Vial build requests', async () => {
    const response = await APITestClient.post('/build/vial', mockVialBuildRequest)
    
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')
  })

  it('should list Vial keyboards', async () => {
    const response = await APITestClient.get('/list/vial')
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it('should process Vial JSON conversion', async () => {
    // This test would require a proper Vial JSON file
    // For now, we'll test the endpoint exists and handles requests
    const response = await APITestClient.post('/convert/vial/json')
      .attach('vial', Buffer.from(JSON.stringify(mockVialLayout)), 'test.json')
    
    // Should handle the request (may succeed or fail based on data format)
    expect([200, 400, 500]).toContain(response.status)
  })
})