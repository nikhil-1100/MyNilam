/**
 * Hostel Routes
 */
import { Router } from 'express'
import { hostelController } from '../controllers/hostel.controller'
import { requireAuth } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { hostelConfigSchema, hostelPricingSchema, hostelVacancySchema } from '../validators/hostel.validator'

export const hostelRouter = Router()

// All hostel routes require auth and hostel_admin or super_admin role
hostelRouter.use(requireAuth)
hostelRouter.use(requireRole('HOSTEL_ADMIN', 'SUPER_ADMIN'))

// My hostel (for hostel_admin's own hostel)
hostelRouter.get('/my', hostelController.getMyHostel)

// Config
hostelRouter.get('/:hostelId/config', hostelController.getConfig)
hostelRouter.put('/property/:propertyId/config', validate({ body: hostelConfigSchema }), hostelController.updateConfig)

// Pricing chart
hostelRouter.get('/:hostelId/pricing', hostelController.getPricing)
hostelRouter.put('/:hostelId/pricing', validate({ body: hostelPricingSchema }), hostelController.updatePricing)

// Vacancy
hostelRouter.put('/:hostelId/vacancy', validate({ body: hostelVacancySchema }), hostelController.updateVacancy)
