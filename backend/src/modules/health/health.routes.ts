import { Router } from 'express'
import type { ApiHealth } from '@prich/shared'

export const healthRouter = Router()

healthRouter.get('/', (_request, response): void => {
  const health: ApiHealth = {
    status: 'ok',
    service: 'prich-api',
    timestamp: new Date().toISOString(),
  }

  response.json(health)
})
