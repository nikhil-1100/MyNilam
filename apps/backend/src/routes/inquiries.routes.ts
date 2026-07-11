import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { sendSuccess, sendCreated } from '../utils/response'
import { NotFoundError, ForbiddenError } from '../utils/errors'

export const inquiriesRouter = Router()
inquiriesRouter.use(requireAuth)

const createSchema = z.object({
  property_id: z.string(),
  message: z.string().min(10).max(1000),
})

const respondSchema = z.object({
  response: z.string().min(1).max(1000),
})

inquiriesRouter.get('/', async (req, res) => {
  const isAdmin = false
  const userId = req.user!.id
  const inquiries = await db.inquiry.findMany({
    where: isAdmin ? {} : {
      OR: [
        { user_id: userId },
        { property: { user_id: userId } },
      ],
    },
    include: {
      user: { select: { id: true, email: true } },
      property: { select: { id: true, title: true, price: true, user_id: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  // Format response for BigInt conversion
  const formatted = inquiries.map(inq => ({
    ...inq,
    id: inq.id.toString(),
    user_id: inq.user_id.toString(),
    property_id: inq.property_id.toString(),
    responded_by: inq.responded_by?.toString() || null,
    user: {
      id: inq.user.id.toString(),
      email: inq.user.email
    },
    property: {
      id: inq.property.id.toString(),
      title: propTitle(inq.property.title),
      price: inq.property.price,
      user_id: inq.property.user_id.toString()
    }
  }))

  sendSuccess(res, formatted)
})

function propTitle(title: string | null): string {
  return title || ''
}

inquiriesRouter.post('/', validate({ body: createSchema }), async (req, res) => {
  const { property_id, message } = req.body
  const property = await db.listListing.findUnique({ where: { id: BigInt(property_id) } })
  if (!property || !property.is_published) throw new NotFoundError('Property')

  const inquiry = await db.inquiry.create({
    data: {
      user_id: req.user!.id,
      property_id: BigInt(property_id),
      message
    },
    include: { property: { select: { id: true, title: true } } },
  })
  sendCreated(res, {
    ...inquiry,
    id: inquiry.id.toString(),
    user_id: inquiry.user_id.toString(),
    property_id: inquiry.property_id.toString(),
    property: {
      id: inquiry.property.id.toString(),
      title: inquiry.property.title
    }
  }, 'Inquiry sent successfully')
})

inquiriesRouter.patch('/:id/respond', validate({ body: respondSchema }), async (req, res) => {
  const inquiryId = String(req.params.id)
  const inquiry = await db.inquiry.findUnique({
    where: { id: BigInt(inquiryId) },
    include: { property: { select: { user_id: true } } },
  })
  if (!inquiry) throw new NotFoundError('Inquiry')

  const canRespond = inquiry.property.user_id === req.user!.id

  if (!canRespond) throw new ForbiddenError('Only the property owner can respond to inquiries')

  const updated = await db.inquiry.update({
    where: { id: BigInt(inquiryId) },
    data: {
      response: req.body.response,
      responded_by: req.user!.id,
      responded_at: new Date(),
      status: 'RESPONDED',
    },
  })
  sendSuccess(res, {
    ...updated,
    id: updated.id.toString(),
    user_id: updated.user_id.toString(),
    property_id: updated.property_id.toString(),
    responded_by: updated.responded_by?.toString() || null
  }, 'Response sent successfully')
})

inquiriesRouter.patch('/:id/close', async (req, res) => {
  const inquiryId = String(req.params.id)
  await db.inquiry.update({
    where: { id: BigInt(inquiryId) },
    data: { status: 'CLOSED' },
  })
  sendSuccess(res, null, 'Inquiry closed')
})
