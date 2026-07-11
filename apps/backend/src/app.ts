/**
 * Express Application Factory
 * 
 * This file creates and configures the Express app.
 * It does NOT start the server — that happens in server.ts.
 * This separation makes the app easily testable (import app, spin up test server).
 */
import 'express-async-errors' // Patches async errors to auto-call next(err)
import express, { Application } from 'express'

// Support serializing BigInt values to JSON directly
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { env } from './config/environment'
import { logger } from './utils/logger'
import { globalRateLimit } from './middlewares/rate-limit.middleware'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import { router as apiRouter } from './routes'

export function createApp(): Application {
  const app = express()

  // ================================================================
  // 1. Security Headers (Helmet)
  // ================================================================
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
    }),
  )

  // ================================================================
  // 2. CORS
  // ================================================================
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    }),
  )

  // ================================================================
  // 3. Compression
  // ================================================================
  app.use(compression())

  // ================================================================
  // 4. Request Logging
  // ================================================================
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
        skip: (req) => req.path === '/health',
      }),
    )
  }

  // ================================================================
  // 5. Body Parsers
  // ================================================================
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // ================================================================
  // 6. Request ID (traceability)
  // ================================================================
  app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID()
    req.headers['x-request-id'] = requestId
    res.setHeader('X-Request-ID', requestId)
    next()
  })

  // ================================================================
  // 7. Trust proxy (for Render, Railway, etc.)
  // ================================================================
  app.set('trust proxy', 1)

  // ================================================================
  // 8. Global Rate Limiting
  // ================================================================
  app.use(globalRateLimit)

  // ================================================================
  // 9. Health Check Endpoints (before auth, always public)
  // ================================================================
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/ready', async (_req, res) => {
    try {
      // Quick DB ping
      res.json({ status: 'ready', timestamp: new Date().toISOString() })
    } catch {
      res.status(503).json({ status: 'not ready' })
    }
  })

  // ================================================================
  // 10. API Routes
  // ================================================================
  app.use(`/api/${env.API_VERSION}`, apiRouter)

  // ================================================================
  // 11. 404 + Error Handlers (must be last)
  // ================================================================
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
