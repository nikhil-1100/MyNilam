/**
 * Auth Controller
 * 
 * Extremely thin — no business logic, only:
 *   1. Extract validated request data
 *   2. Call authService
 *   3. Send response
 */
import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response'

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const user = await authService.register(req.body)
    sendCreated(res, user, 'Account created successfully. Please verify your email.')
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body, {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    })
    sendSuccess(res, result, 'Login successful')
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const result = await authService.refreshTokens(req.body.refresh_token, {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    })
    sendSuccess(res, result, 'Token refreshed')
  },

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.body.refresh_token)
    sendNoContent(res)
  },

  async logoutAll(req: Request, res: Response): Promise<void> {
    await authService.logoutAll(String(req.user!.id))
    sendNoContent(res)
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.getMe(String(req.user!.id))
    sendSuccess(res, user)
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const user = await authService.updateProfile(String(req.user!.id), req.body)
    sendSuccess(res, user, 'Profile updated successfully')
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await authService.forgotPassword(req.body)
    // Always return 200 to prevent email enumeration
    sendSuccess(res, null, 'If an account exists with this email, a password reset link has been sent.')
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    await authService.resetPassword(req.body)
    sendSuccess(res, null, 'Password reset successfully. Please log in with your new password.')
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    await authService.changePassword(String(req.user!.id), req.body)
    sendSuccess(res, null, 'Password changed successfully. All other sessions have been logged out.')
  },
}
