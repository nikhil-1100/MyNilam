/**
 * Auth Repository (Aligned with 21-Module Schema)
 */
import crypto from 'crypto'
import { db } from '../config/database'

export const authRepository = {
  async findByEmail(email: string) {
    return db.authUser.findFirst({ where: { email, is_deleted: false } })
  },

  async findById(id: string) {
    return db.authUser.findFirst({
      where: { id: BigInt(id), is_active: true, is_deleted: false },
    })
  },

  async createUser(data: {
    email: string
    passwordHash: string
    full_name?: string
  }) {
    return db.authUser.create({
      data: {
        email: data.email,
        password_hash: data.passwordHash,
        profile: {
          create: {
            display_name: data.full_name || '',
          }
        }
      },
    })
  },

  async updateUser(id: string, data: Record<string, any>) {
    return db.authUser.update({
      where: { id: BigInt(id) },
      data,
    })
  },

  async softDeleteUser(id: string) {
    await db.authUser.update({
      where: { id: BigInt(id) },
      data: {
        is_active: false,
        is_deleted: true,
        deleted_date: new Date(),
      },
    })
  },

  // ---- Refresh Tokens ----

  async createRefreshToken(data: {
    tokenHash: string
    userId: string
    expiresDate: Date
    createdByIp?: string
  }) {
    const hashed = crypto.createHash('sha256').update(data.tokenHash).digest('hex')
    return db.authRefreshToken.create({
      data: {
        token_hash: hashed,
        user_id: BigInt(data.userId),
        expires_date: data.expiresDate,
        created_by_ip: data.createdByIp,
      }
    })
  },

  async findRefreshToken(tokenHash: string) {
    const hashed = crypto.createHash('sha256').update(tokenHash).digest('hex')
    return db.authRefreshToken.findFirst({
      where: {
        token_hash: hashed,
        is_revoked: false,
        expires_date: { gt: new Date() }
      },
    })
  },

  async revokeRefreshToken(tokenHash: string) {
    const hashed = crypto.createHash('sha256').update(tokenHash).digest('hex')
    await db.authRefreshToken.updateMany({
      where: { token_hash: hashed },
      data: {
        is_revoked: true,
        revoked_date: new Date(),
      },
    })
  },

  async revokeAllUserRefreshTokens(userId: string) {
    await db.authRefreshToken.updateMany({
      where: {
        user_id: BigInt(userId),
        is_revoked: false,
      },
      data: {
        is_revoked: true,
        revoked_date: new Date(),
      },
    })
  },

  async deleteExpiredRefreshTokens() {
    const result = await db.authRefreshToken.deleteMany({
      where: { expires_date: { lt: new Date() } },
    })
    return result.count
  },

  // ---- Password Reset Tokens (Mapped to generalized AuthUserOTP) ----

  async createPasswordResetToken(data: {
    email: string
    tokenHash: string
    expiresDate: Date
  }) {
    const user = await this.findByEmail(data.email)
    if (!user) {
      throw new Error('User not found')
    }

    return db.authUserOTP.create({
      data: {
        user_id: user.id,
        otp_hash: data.tokenHash,
        otp_type: 'Email',
        purpose: 'PasswordReset',
        expires_date: data.expiresDate,
      }
    })
  },

  async findPasswordResetToken(tokenHash: string) {
    const otp = await db.authUserOTP.findFirst({
      where: {
        otp_hash: tokenHash,
        purpose: 'PasswordReset',
        is_validated: false,
        expires_date: { gt: new Date() }
      },
      include: {
        user: true,
      }
    })

    if (!otp) return null

    // Map to structure expected by auth service (including an email field)
    return {
      id: otp.id.toString(),
      token: otp.otp_hash,
      email: otp.user.email,
      expires_at: otp.expires_date,
      used: otp.is_validated,
    }
  },

  async markPasswordResetTokenUsed(id: string) {
    await db.authUserOTP.update({
      where: { id: BigInt(id) },
      data: { is_validated: true },
    })
  },
}
