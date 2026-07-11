/**
 * Prisma Database Client
 * 
 * Singleton pattern — one Prisma instance per Node.js process.
 * In development, we attach it to `global` to survive hot reloads.
 */
import { PrismaClient } from '@prisma/client'
import { env } from './environment'

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  })
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db: ReturnType<typeof createPrismaClient> =
  global.__prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  global.__prisma = db
}

/**
 * Connect to the database.
 * Called once at server startup.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await db.$connect()
    console.log('✅  Database connected successfully')
  } catch (error) {
    console.error('❌  Database connection failed:', error)
    if (env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.warn('⚠️  Database is currently offline. The server will remain active, but requests requiring database queries will fail.')
    }
  }
}

/**
 * Gracefully disconnect from the database.
 * Called on process termination.
 */
export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect()
}
