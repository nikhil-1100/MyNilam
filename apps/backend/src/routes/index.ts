/**
 * API Router — /api/v1
 * 
 * Aggregates all domain routers into a single versioned router.
 * Each domain is fully self-contained with its own routes/controller/service.
 */
import { Router } from 'express'
import { authRouter } from './auth.routes'
import { propertiesRouter } from './properties.routes'
import { hostelRouter } from './hostel.routes'
import { favoritesRouter } from './favorites.routes'
import { inquiriesRouter } from './inquiries.routes'
import { messagesRouter } from './messages.routes'
import { reviewsRouter } from './reviews.routes'
import { visitsRouter } from './visits.routes'
import { notificationsRouter } from './notifications.routes'
import { usersRouter } from './users.routes'
import { adminRouter } from './admin.routes'

export const router = Router()

router.use('/auth',          authRouter)
router.use('/properties',    propertiesRouter)
router.use('/hostel',        hostelRouter)
router.use('/favorites',     favoritesRouter)
router.use('/inquiries',     inquiriesRouter)
router.use('/messages',      messagesRouter)
router.use('/reviews',       reviewsRouter)
router.use('/visits',        visitsRouter)
router.use('/notifications', notificationsRouter)
router.use('/users',         usersRouter)
router.use('/admin',         adminRouter)
