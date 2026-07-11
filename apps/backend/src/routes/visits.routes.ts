import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { sendSuccess, sendCreated } from '../utils/response'
import { NotFoundError, ForbiddenError } from '../utils/errors'

export const visitsRouter = Router()
visitsRouter.use(requireAuth)

const createSchema = z.object({
  property_id: z.string(),
  scheduled_at: z.coerce.date().refine((d) => d > new Date(), 'Visit must be in the future'),
  notes: z.string().max(500).optional(),
})

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
  owner_notes: z.string().max(500).optional(),
})

visitsRouter.get('/', async (req, res) => {
  const isAdmin = false
  const userId = req.user!.id
  const visits = await db.visit.findMany({
    where: isAdmin ? {} : {
      OR: [{ user_id: userId }, { property: { user_id: userId } }],
    },
    include: {
      user: { select: { id: true, email: true } },
      property: { select: { id: true, title: true, street_address: true } },
    },
    orderBy: { scheduled_at: 'asc' },
  })
  sendSuccess(res, visits)
})

visitsRouter.post('/', validate({ body: createSchema }), async (req, res) => {
  const propertyId = req.body.property_id
  const property = await db.listListing.findUnique({ where: { id: BigInt(propertyId) } })
  if (!property || !property.is_published) throw new NotFoundError('Property')

  const visit = await db.visit.create({
    data: {
      user_id: req.user!.id,
      property_id: BigInt(propertyId),
      scheduled_at: req.body.scheduled_at,
      notes: req.body.notes,
    },
    include: { property: { select: { id: true, title: true, street_address: true } } },
  })
  sendSuccess(res, visit) // sendCreated or sendSuccess
})

visitsRouter.patch('/:id/status', validate({ body: statusSchema }), async (req, res) => {
  const visitId = String(req.params.id)
  const visit = await db.visit.findUnique({
    where: { id: BigInt(visitId) },
    include: { property: { select: { user_id: true } } },
  })
  if (!visit) throw new NotFoundError('Visit')

  const canUpdate = visit.property.user_id === req.user!.id

  if (!canUpdate) throw new ForbiddenError('Only the property owner can update visit status')

  const updated = await db.visit.update({
    where: { id: BigInt(visitId) },
    data: { status: req.body.status, owner_notes: req.body.owner_notes },
  })
  sendSuccess(res, updated, 'Visit status updated')
})

visitsRouter.delete('/:id', async (req, res) => {
  const visitId = String(req.params.id)
  const visit = await db.visit.findUnique({ where: { id: BigInt(visitId) } })
  if (!visit) throw new NotFoundError('Visit')
  if (visit.user_id !== req.user!.id) throw new ForbiddenError("Cannot cancel another user's visit")

  await db.visit.update({ where: { id: BigInt(visitId) }, data: { status: 'CANCELLED' } })
  sendSuccess(res, null, 'Visit cancelled')
})
