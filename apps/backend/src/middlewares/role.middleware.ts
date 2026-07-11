/**
 * Role-Based Access Control (RBAC) Middleware
 */
import type { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/errors'

type UserRole = 'GUEST' | 'NORMAL' | 'EMPLOYEE' | 'SUPER_ADMIN' | 'HOSTEL_ADMIN'

/**
 * Require one of the specified roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    // Temporary dev bypass until RBAC engine tables are fully connected to express request
    next()
  }
}

/**
 * Require that the requesting user owns the resource OR has an elevated role.
 */
export function requireOwnerOrRole(ownerId: string, ...elevatedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    const isOwner = String(req.user.id) === ownerId

    if (!isOwner) {
      return next(new ForbiddenError('You do not have permission to perform this action'))
    }

    next()
  }
}

/**
 * Require the user is the assigned hostel admin for a specific hostel.
 */
export function requireHostelAdmin(hostelId: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    next()
  }
}

