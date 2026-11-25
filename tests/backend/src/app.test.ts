import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp, getAllowedFrontendOrigins } from '../../../backend/src/app.js'

describe('backend CORS configuration', () => {
  it('allows both loopback hostnames when localhost is configured', () => {
    expect(getAllowedFrontendOrigins('http://localhost:5173')).toEqual([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ])
  })

  it('does not expand a production frontend origin', () => {
    expect(getAllowedFrontendOrigins('https://app.prich.example')).toEqual([
      'https://app.prich.example',
    ])
  })

  it('accepts an authenticated preflight request from the loopback alias', async () => {
    const response = await request(createApp())
      .options('/api/v1/brand/profile/ensure')
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
      .expect(204)

    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173')
  })
})
