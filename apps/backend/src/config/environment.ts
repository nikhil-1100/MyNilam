/**
 * Environment Configuration
 * 
 * All environment variables are validated at startup using Zod.
 * If any required variable is missing, the server will refuse to start
 * with a clear error message — no silent failures.
 */
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

// Load .env file relative to this file's location
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Rentel API'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@rentel.com'),
  FROM_NAME: z.string().default('Rentel'),

  // Storage
  STORAGE_BUCKET_IMAGES: z.string().default('property-images'),
  STORAGE_BUCKET_VIDEOS: z.string().default('property-videos'),
  STORAGE_BUCKET_AVATARS: z.string().default('avatars'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_GLOBAL: z.coerce.number().default(100),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(10),

  // App URLs
  CLIENT_WEB_URL: z.string().default('http://localhost:3000'),
  CLIENT_MOBILE_SCHEME: z.string().default('rentel://'),

  // File Upload
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  MAX_IMAGE_COUNT: z.coerce.number().default(10),
  MAX_VIDEO_COUNT: z.coerce.number().default(3),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌  Invalid environment configuration:')
    result.error.issues.forEach((issue) => {
      console.error(`   [${issue.path.join('.')}] ${issue.message}`)
    })
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()

export type Env = typeof env
