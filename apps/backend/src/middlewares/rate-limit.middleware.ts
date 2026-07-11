/**
 * Rate Limiting Middleware
 * 
 * Three profiles: global, auth (brute force), upload, password reset
 */
import rateLimit from 'express-rate-limit'
import { env } from '../config/environment'

/**
 * Global rate limit — applied to all routes
 */
export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_GLOBAL,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down and try again later.',
    },
  },
  skip: (req) => req.path === '/health' || req.path === '/ready',
})

/**
 * Auth rate limit — strict per IP, brute force protection
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX_AUTH,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || ''
    return `${req.ip}:${email}`
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    },
  },
})

/**
 * Upload rate limit — prevent upload spam
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please wait before uploading more files.',
    },
  },
})

/**
 * Password reset rate limit — prevent email bombing
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset requests. Please try again in 1 hour.',
    },
  },
})
