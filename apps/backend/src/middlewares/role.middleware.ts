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

    const userRole = req.user.role as UserRole
    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError('You do not have permission to perform this action'))
    }

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
    const userRole = req.user.role as UserRole
    const hasElevatedRole = elevatedRoles.includes(userRole)

    if (!isOwner && !hasElevatedRole) {
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

    const userRole = req.user.role as UserRole

    // Super admin bypass
    if (userRole === 'SUPER_ADMIN') {
      return next()
    }

    // Check if user is hostel admin and assigned to this hostel
    const isAssigned =
      userRole === 'HOSTEL_ADMIN' &&
      req.user.assigned_hostel_id !== null &&
      String(req.user.assigned_hostel_id) === hostelId

    if (!isAssigned) {
      return next(new ForbiddenError('You do not have permission to manage this hostel'))
    }

    next()
  }
}

