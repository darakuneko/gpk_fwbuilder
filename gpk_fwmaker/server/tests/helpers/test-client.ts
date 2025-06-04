import request from 'supertest'
import app from '../../src/app'

export const testRequest = request(app)

export class APITestClient {
  static async get(path: string) {
    return testRequest.get(path)
  }

  static async post(path: string, data?: any) {
    return testRequest
      .post(path)
      .send(data)
      .set('Content-Type', 'application/json')
  }

  static async postFile(path: string, files: Record<string, string>, data?: any) {
    const req = testRequest.post(path)
    
    Object.entries(files).forEach(([field, filepath]) => {
      req.attach(field, filepath)
    })
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        req.field(key, value as string)
      })
    }
    
    return req
  }
}