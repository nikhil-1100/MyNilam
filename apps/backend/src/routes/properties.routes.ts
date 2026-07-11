/**
 * Properties Routes
 */
import { Router } from 'express'
import { propertyController } from '../controllers/property.controller'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema,
  rejectPropertySchema,
  nearbySchema,
} from '../validators/property.validator'

export const propertiesRouter = Router()

// Public (no auth needed)
propertiesRouter.get('/featured', propertyController.getFeatured)
propertiesRouter.get('/trending', propertyController.getTrending)
propertiesRouter.get('/nearby', validate({ query: nearbySchema }), propertyController.getNearby)

// Auth required
propertiesRouter.get('/my', requireAuth, propertyController.getMyListings)
propertiesRouter.get('/pending', requireAuth, requireRole('EMPLOYEE', 'SUPER_ADMIN'), propertyController.getPending)

// List with optional auth (for favorites state)
propertiesRouter.get('/', optionalAuth, validate({ query: propertyFiltersSchema }), propertyController.list)

// Single property
propertiesRouter.get('/:id', optionalAuth, propertyController.getById)

// Create (normal user and above)
propertiesRouter.post(
  '/',
  requireAuth,
  requireRole('NORMAL', 'EMPLOYEE', 'SUPER_ADMIN'),
  validate({ body: createPropertySchema }),
  propertyController.create,
)

// Update (owner or admin)
propertiesRouter.put('/:id', requireAuth, validate({ body: updatePropertySchema }), propertyController.update)
propertiesRouter.patch('/:id', requireAuth, validate({ body: updatePropertySchema }), propertyController.update)

// Delete
propertiesRouter.delete('/:id', requireAuth, propertyController.delete)

// Moderation (employee+)
propertiesRouter.post('/:id/publish', requireAuth, requireRole('EMPLOYEE', 'SUPER_ADMIN'), propertyController.publish)
propertiesRouter.post('/:id/reject', requireAuth, requireRole('EMPLOYEE', 'SUPER_ADMIN'), validate({ body: rejectPropertySchema }), propertyController.reject)
