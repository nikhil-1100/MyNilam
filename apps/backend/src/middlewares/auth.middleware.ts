/**
 * Authentication Middleware
 * 
 * Verifies Bearer JWT token and attaches the decoded user to req.user.
 * Use `requireAuth` for protected routes.
 * Use `optionalAuth` for routes that work both with and without auth.
 */
import type { Request, Response, NextFunction } from 'express'
import { db } from '../config/database'
import { verifyAccessToken, extractBearerToken } from '../utils/jwt'
import { UnauthorizedError } from '../utils/errors'

/**
 * Require a valid JWT.
 * Attaches `req.user` from the database (always fresh).
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization)
    if (!token) {
      throw new UnauthorizedError('No authentication token provided')
    }

    const payload = verifyAccessToken(token)

    // Fetch fresh user from DB (catches deactivated accounts)
    const user = await db.authUser.findUnique({
      where: { id: BigInt(payload.sub), is_active: true, is_deleted: false },
      select: {
        id: true,
        email: true,
        is_active: true,
        is_deleted: true,
        created_date: true,
      },
    })

    if (!user) {
      throw new UnauthorizedError('User account not found or deactivated')
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Optional auth — doesn't fail if no token provided.
 * Attaches req.user if valid token is present.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization)
    if (!token) {
      return next()
    }

    const payload = verifyAccessToken(token)

    const user = await db.authUser.findUnique({
      where: { id: BigInt(payload.sub), is_active: true, is_deleted: false },
      select: {
        id: true,
        email: true,
        is_active: true,
        is_deleted: true,
        created_date: true,
      },
    })

    if (user) {
      req.user = user
    }

    next()
  } catch {
    // If token is invalid in optional auth, just continue without user
    next()
  }
}
