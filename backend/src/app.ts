import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { errorHandler } from './middleware/error_handler.js'
import { createBrandProfileRouter } from './modules/brand_profile/brand_profile.routes.js'
import { createCreatorProfileRouter } from './modules/creator_profile/creator_profile.routes.js'
import { createCampaignRouter } from './modules/campaigns/campaigns.routes.js'
import { createSocialHandleRouter } from './modules/social_handles/social_handles.routes.js'
import { healthRouter } from './modules/health/health.routes.js'

/**
 * Returns the configured frontend origin and its equivalent loopback alias for local development.
 * @param frontendUrl - The exact frontend origin configured for the API.
 * @returns The origins allowed to make browser requests to the API.
 */
export function getAllowedFrontendOrigins(frontendUrl: string): string[] {
  const allowedOrigins = [frontendUrl]

  try {
    const url = new URL(frontendUrl)

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      const alternateUrl = new URL(url.toString())
      alternateUrl.hostname = url.hostname === 'localhost' ? '127.0.0.1' : 'localhost'
      allowedOrigins.push(alternateUrl.origin)
    }
  } catch {
    // The configured value remains the only allowed origin when it is not a valid URL.
  }

  return allowedOrigins
}

/**
 * Creates the configured Prich HTTP API.
 * @returns An Express application with security and versioned business routes.
 */
export function createApp(): express.Express {
  const app = express()
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    origin: getAllowedFrontendOrigins(frontendUrl),
  }))
  app.use(rateLimit({
    limit: 120,
    standardHeaders: 'draft-8',
    windowMs: 60_000,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use('/api/health', healthRouter)
  app.use('/api/v1/brand/profile', createBrandProfileRouter())
  app.use('/api/v1/creator/profile', createCreatorProfileRouter())
  app.use('/api/v1/marketplace', createCampaignRouter())
  app.use('/api/v1/social-handles', createSocialHandleRouter())
  app.use(errorHandler)

  return app
}
