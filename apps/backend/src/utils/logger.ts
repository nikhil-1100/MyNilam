/**
 * Structured Logger (Pino)
 * 
 * In development: pretty-printed with colors
 * In production: JSON output for log aggregation (Datadog, CloudWatch, etc.)
 */
import pino from 'pino'
import { env } from '../config/environment'

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        // Production: structured JSON for log aggregation
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
})

export type Logger = typeof logger
