import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../../../../backend/src/app.js'

describe('GET /api/health', () => {
  it('returns the API health contract', async () => {
    const response = await request(createApp()).get('/api/health').expect(200)

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'prich-api',
    })
    expect(response.body.timestamp).toEqual(expect.any(String))
  })
})
