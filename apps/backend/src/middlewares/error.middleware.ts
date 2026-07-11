/**
 * Centralized Error Handler Middleware
 */
import type { Request, Response, NextFunction } from 'express'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import multer from 'multer'
import { AppError, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import { env } from '../config/environment'

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string | undefined

  // ---- 1. Known operational errors ----
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(
        { err: error, requestId, path: req.path, method: req.method },
        'Operational server error',
      )
    } else {
      logger.warn(
        { code: error.code, path: req.path, statusCode: error.statusCode },
        error.message,
      )
    }

    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    }

    if (error instanceof ValidationError && error.errors) {
      ;(body.error as Record<string, unknown>).errors = error.errors
    }

    if (requestId) body.requestId = requestId

    res.status(error.statusCode).json(body)
    return
  }

  // ---- 2. Prisma errors ----
  if (error instanceof PrismaClientKnownRequestError) {
    logger.warn({ code: error.code, meta: error.meta, path: req.path }, 'Prisma error')

    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[])?.join(', ') ?? 'field'
        res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: `A record with this ${target} already exists` },
        })
        return
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Record not found' },
        })
        return
      case 'P2003':
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_REFERENCE', message: 'Referenced record does not exist' },
        })
        return
      default:
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: env.NODE_ENV === 'production' ? 'A database error occurred' : error.message,
          },
        })
        return
    }
  }

  if (error instanceof PrismaClientValidationError) {
    logger.warn({ path: req.path }, 'Prisma validation error')
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: env.NODE_ENV === 'production' ? 'Invalid data provided' : error.message,
      },
    })
    return
  }

  // ---- 3. Multer errors ----
  if (error instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File is too large',
      LIMIT_FILE_COUNT: 'Too many files uploaded',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    }
    res.status(413).json({
      success: false,
      error: { code: 'FILE_ERROR', message: messages[error.code] ?? error.message },
    })
    return
  }

  // ---- 4. Unknown / programmer errors ----
  logger.error(
    { err: error, requestId, path: req.path, method: req.method },
    'Unhandled error',
  )

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : (error as Error)?.message ?? 'Unknown error',
    },
    ...(requestId && { requestId }),
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
}
