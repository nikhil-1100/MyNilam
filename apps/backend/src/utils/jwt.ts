/**
 * JWT Utilities
 * 
 * Access tokens: short-lived (15m), used for API requests
 * Refresh tokens: long-lived (30d), stored in DB, rotated on each use
 */
import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../config/environment'
import { UnauthorizedError } from './errors'

export interface AccessTokenPayload {
  sub: string          // User ID
  email: string
  role: string
  type: 'access'
}

export interface RefreshTokenPayload {
  sub: string          // User ID
  jti: string          // JWT ID — maps to DB refresh token record
  type: 'refresh'
}

/**
 * Sign a short-lived access token
 */
export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions,
  )
}

/**
 * Sign a long-lived refresh token
 */
export function signRefreshToken(
  userId: string,
  jti: string,
): string {
  return jwt.sign(
    { sub: userId, jti, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions,
  )
}

/**
 * Verify and decode an access token.
 * Throws UnauthorizedError if invalid or expired.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type')
    }
    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token')
    }
    throw error
  }
}

/**
 * Verify and decode a refresh token.
 * Throws UnauthorizedError if invalid or expired.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type')
    }
    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired, please log in again')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token')
    }
    throw error
  }
}

/**
 * Extract token from Authorization header.
 * Accepts: "Bearer <token>"
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}
