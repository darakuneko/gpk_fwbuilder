import { describe, it, expect } from 'vitest'
import { APITestClient } from '../helpers/test-client'

describe('Basic API Endpoints', () => {
  it('should return welcome message', async () => {
    const response = await APITestClient.get('/')
    
    expect(response.status).toBe(200)
    expect(response.text).toBe('GPK FWMaker!')
  })

  it('should return QMK tags', async () => {
    const response = await APITestClient.get('/tags/qmk')
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
    
    // Check if first tag matches version format (x.y.z)
    if (response.body.length > 0) {
      expect(response.body[0]).toMatch(/^\d+\.\d+\.\d+$/)
    }
  })

  it('should return 404 for unknown endpoints', async () => {
    const response = await APITestClient.get('/nonexistent-endpoint')
    
    expect(response.status).toBe(404)
  })
})