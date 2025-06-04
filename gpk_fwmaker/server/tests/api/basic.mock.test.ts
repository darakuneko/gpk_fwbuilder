import { describe, it, expect, vi, beforeAll } from 'vitest'
import { APITestClient } from '../helpers/test-client'

// Mock the command module to avoid actual QMK operations
vi.mock('../../src/command', () => ({
  cmd: {
    tags: vi.fn().mockResolvedValue(['0.19.3', '0.19.2', '0.19.1']),
    dirClient: '/tmp/test',
    dirQMK: '/tmp/qmk',
    dirVial: '/tmp/vial'
  },
  streamResponse: vi.fn(),
  streamError: vi.fn(),
  streamEnd: vi.fn()
}))

describe('Basic API Endpoints (Mocked)', () => {
  it('should return welcome message', async () => {
    const response = await APITestClient.get('/')
    
    expect(response.status).toBe(200)
    expect(response.text).toBe('GPK FWMaker!')
  })

  it('should return mocked QMK tags', async () => {
    const response = await APITestClient.get('/tags/qmk')
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toEqual(['0.19.3', '0.19.2', '0.19.1'])
  })

  it('should return 404 for unknown endpoints', async () => {
    const response = await APITestClient.get('/nonexistent-endpoint')
    
    expect(response.status).toBe(404)
  })
})