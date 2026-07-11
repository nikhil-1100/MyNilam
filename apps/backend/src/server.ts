/**
 * Server Entry Point
 * 
 * Responsibilities:
 *   1. Create Express app
 *   2. Connect to database + Redis
 *   3. Start HTTP server
 *   4. Register graceful shutdown handlers
 */
import { createApp } from './app'
import { connectDatabase, disconnectDatabase } from './config/database'
import { connectRedis, disconnectRedis } from './config/redis'
import { env } from './config/environment'
import { logger } from './utils/logger'

async function startServer(): Promise<void> {
  // ---- Connect infrastructure ----
  await connectDatabase()
  await connectRedis()

  // ---- Start HTTP server ----
  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀  Rentel API running on http://localhost:${env.PORT}/api/${env.API_VERSION}`)
    logger.info(`📝  Environment: ${env.NODE_ENV}`)
    logger.info(`🏥  Health: http://localhost:${env.PORT}/health`)
  })

  // ---- Graceful shutdown ----
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — starting graceful shutdown`)

    server.close(async () => {
      logger.info('HTTP server closed')

      await disconnectDatabase()
      await disconnectRedis()

      logger.info('Graceful shutdown complete')
      process.exit(0)
    })

    // Force shutdown after 30s if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection')
    // Don't exit — log it and continue
  })

  // Catch uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception — shutting down')
    process.exit(1)
  })
}

startServer().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start server')
  process.exit(1)
})
