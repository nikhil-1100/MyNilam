/**
 * Auth Routes
 * 
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/logout-all
 * GET  /api/v1/auth/me
 * PATCH /api/v1/auth/profile
 * POST /api/v1/auth/forgot-password
 * POST /api/v1/auth/reset-password
 * POST /api/v1/auth/change-password
 */
import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { authRateLimit, passwordResetRateLimit } from '../middlewares/rate-limit.middleware'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validator'

export const authRouter = Router()

// Public routes
authRouter.post(
  '/register',
  authRateLimit,
  validate({ body: registerSchema }),
  authController.register,
)

authRouter.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  authController.login,
)

authRouter.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  authController.refresh,
)

authRouter.post(
  '/forgot-password',
  passwordResetRateLimit,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
)

authRouter.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
)

// Protected routes (require valid JWT)
authRouter.post(
  '/logout',
  requireAuth,
  authController.logout,
)

authRouter.post(
  '/logout-all',
  requireAuth,
  authController.logoutAll,
)

authRouter.get(
  '/me',
  requireAuth,
  authController.me,
)

authRouter.patch(
  '/profile',
  requireAuth,
  validate({ body: updateProfileSchema }),
  authController.updateProfile,
)

authRouter.post(
  '/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
)
