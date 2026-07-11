/**
 * Zod Validation Middleware
 * 
 * Validates request body, query params, and URL params against Zod schemas.
 * Returns 400 with structured field-level errors on validation failure.
 * 
 * Usage:
 *   router.post('/', validate({ body: createPropertySchema }), handler)
 *   router.get('/', validate({ query: propertyFiltersSchema }), handler)
 */
import type { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { ValidationError } from '../utils/errors'

interface ValidationTargets {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

/**
 * Validate request against one or more Zod schemas.
 * Attaches parsed (coerced, transformed) data back to req.
 */
export function validate(schemas: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query)
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params)
      }
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Group errors by field path
        const errors: Record<string, string[]> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.') || 'root'
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(issue.message)
        })
        next(new ValidationError('Validation failed', errors))
      } else {
        next(error)
      }
    }
  }
}

// Common reusable param schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})
