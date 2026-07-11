/**
 * Auth Service
 */
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { authRepository } from '../repositories/auth.repository'
import { hashPassword, verifyPassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../utils/errors'
import { logger } from '../utils/logger'
import { AUTH } from '../config/constants'
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validator'

function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

function sanitizeUser(user: Record<string, unknown>) {
  const { password_hash, is_deleted, deleted_date, ...safe } = user
  return safe
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('An account with this email already exists')

    const passwordHash = await hashPassword(input.password)
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      full_name: input.full_name,
    })

    logger.info({ userId: user.id }, 'New user registered')
    return sanitizeUser(user as unknown as Record<string, unknown>)
  },

  async login(input: LoginInput, meta?: { ip_address?: string; user_agent?: string }) {
    const user = await authRepository.findByEmail(input.email)

    if (!user || !user.password_hash) {
      await hashPassword('dummy_prevent_timing')
      throw new UnauthorizedError('Invalid email or password')
    }

    if (!user.is_active || user.is_deleted) {
      throw new ForbiddenError('This account has been deactivated')
    }

    const isValid = await verifyPassword(user.password_hash, input.password)
    if (!isValid) throw new UnauthorizedError('Invalid email or password')

    const jti = uuidv4()
    const accessToken = signAccessToken({ sub: String(user.id), email: user.email, role: 'normal' })
    const refreshToken = signRefreshToken(String(user.id), jti)

    await authRepository.createRefreshToken({
      tokenHash: refreshToken,
      userId: String(user.id),
      expiresDate: refreshTokenExpiresAt(),
      createdByIp: meta?.ip_address,
    })

    logger.info({ userId: user.id }, 'User logged in')

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer' as const,
      expires_in: 15 * 60,
      user: sanitizeUser(user as unknown as Record<string, unknown>),
    }
  },

  async refreshTokens(refreshToken: string, meta?: { ip_address?: string; user_agent?: string }) {
    const payload = verifyRefreshToken(refreshToken)
    const stored = await authRepository.findRefreshToken(refreshToken)

    if (!stored) {
      logger.warn({ userId: payload.sub }, 'Refresh token reuse detected — revoking all')
      await authRepository.revokeAllUserRefreshTokens(payload.sub)
      throw new UnauthorizedError('Invalid or revoked refresh token')
    }

    const user = await authRepository.findById(payload.sub)
    if (!user) throw new UnauthorizedError('User not found')

    await authRepository.revokeRefreshToken(refreshToken)

    const jti = uuidv4()
    const newAccess = signAccessToken({ sub: String(user.id), email: user.email, role: 'normal' })
    const newRefresh = signRefreshToken(String(user.id), jti)

    await authRepository.createRefreshToken({
      tokenHash: newRefresh,
      userId: String(user.id),
      expiresDate: refreshTokenExpiresAt(),
      createdByIp: meta?.ip_address,
    })

    return { access_token: newAccess, refresh_token: newRefresh, token_type: 'Bearer' as const, expires_in: 15 * 60 }
  },

  async logout(refreshToken: string) {
    if (refreshToken) await authRepository.revokeRefreshToken(refreshToken)
  },

  async logoutAll(userId: string) {
    await authRepository.revokeAllUserRefreshTokens(userId)
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId)
    if (!user) throw new NotFoundError('User')
    return sanitizeUser(user as unknown as Record<string, unknown>)
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const data: Record<string, unknown> = {}
    if (input.full_name) data.full_name = input.full_name

    const user = await authRepository.updateUser(userId, data)
    return sanitizeUser(user as unknown as Record<string, unknown>)
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await authRepository.findByEmail(input.email)
    if (!user || !user.is_active) return

    const token = crypto.randomBytes(32).toString('hex')
    const expiresDate = new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000)

    await authRepository.createPasswordResetToken({ email: user.email, tokenHash: token, expiresDate })
    logger.info({ userId: user.id }, 'Password reset token generated')
  },

  async resetPassword(input: ResetPasswordInput) {
    const resetToken = await authRepository.findPasswordResetToken(input.token)
    if (!resetToken) throw new ValidationError('Invalid or expired password reset token')

    const user = await authRepository.findByEmail(resetToken.email)
    if (!user) throw new NotFoundError('User')

    const passwordHash = await hashPassword(input.password)
    await Promise.all([
      authRepository.updateUser(String(user.id), { password_hash: passwordHash }),
      authRepository.markPasswordResetTokenUsed(resetToken.id),
      authRepository.revokeAllUserRefreshTokens(String(user.id)),
    ])
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await authRepository.findById(userId)
    if (!user || !user.password_hash) throw new NotFoundError('User')

    const isCurrentValid = await verifyPassword(user.password_hash, input.current_password)
    if (!isCurrentValid) throw new UnauthorizedError('Current password is incorrect')

    if (input.current_password === input.new_password) {
      throw new ValidationError('New password must be different from current password')
    }

    const passwordHash = await hashPassword(input.new_password)
    await Promise.all([
      authRepository.updateUser(userId, { password_hash: passwordHash }),
      authRepository.revokeAllUserRefreshTokens(userId),
    ])
  },
}
