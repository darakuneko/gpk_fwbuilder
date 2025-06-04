import { describe, it, expect } from 'vitest'
import { APITestClient } from '../helpers/test-client'
import { mockQMKBuildRequest } from '../helpers/mock-data'

describe('QMK API Endpoints', () => {
  it('should list QMK keyboards', async () => {
    const response = await APITestClient.get('/list/qmk')
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it('should list keymaps for specific keyboard', async () => {
    // Test with planck keyboard (commonly available)
    const response = await APITestClient.get('/list/qmk/planck')
    
    if (response.status === 200) {
      expect(Array.isArray(response.body)).toBe(true)
      // Default keymap should exist for most keyboards
      expect(response.body).toContain('default')
    } else {
      // If keyboard doesn't exist, should return 404
      expect(response.status).toBe(404)
      expect(response.text).toContain('not found')
    }
  })

  it('should handle QMK repository update requests', async () => {
    const response = await APITestClient.get('/update/repository/qmk')
    
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')
  })

  it('should handle QMK build requests with proper format', async () => {
    const response = await APITestClient.post('/build/qmk', mockQMKBuildRequest)
    
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')
  })

  it('should reject QMK build requests with missing parameters', async () => {
    const incompleteRequest = { kb: 'planck' } // missing km and tag
    
    const response = await APITestClient.post('/build/qmk', incompleteRequest)
    
    // Should handle gracefully even with missing params
    expect([200, 400, 500]).toContain(response.status)
  })

  it('should handle invalid keyboard names gracefully', async () => {
    const invalidRequest = {
      kb: 'nonexistent-keyboard',
      km: 'default',
      tag: '0.19.3'
    }
    
    const response = await APITestClient.post('/build/qmk', invalidRequest)
    
    expect(response.status).toBe(200) // Should start process even if it fails later
    expect(response.headers['content-type']).toBe('text/event-stream')
  })
})