/**
 * Express Request Type Extensions
 * 
 * Extends the Express Request interface to include our custom properties.
 * This gives full TypeScript IntelliSense for req.user in all handlers.
 */
import type { AuthUser } from '@prisma/client'

type RequestUser = Pick<
  AuthUser,
  | 'id'
  | 'email'
  | 'is_active'
  | 'is_deleted'
  | 'created_date'
  | 'role'
  | 'assigned_hostel_id'
>

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user — populated by `requireAuth` middleware.
       * undefined on unauthenticated/optional routes.
       */
      user?: RequestUser
    }
  }
}

export {}

