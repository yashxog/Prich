import cors from 'cors'
import express from 'express'
import { healthRouter } from './modules/health/health.routes.js'

export function createApp() {
  const app = express()
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

  app.disable('x-powered-by')
  app.use(cors({ origin: frontendUrl }))
  app.use(express.json({ limit: '1mb' }))
  app.use('/api/health', healthRouter)

  return app
}
