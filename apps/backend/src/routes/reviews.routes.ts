import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response'
import { NotFoundError, ForbiddenError } from '../utils/errors'

export const reviewsRouter = Router()

const createSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// GET /reviews/property/:propertyId
reviewsRouter.get('/property/:propertyId', optionalAuth, async (req, res) => {
  const propertyId = String(req.params.propertyId)
  const page = parseInt(String(req.query.page ?? '1'))
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const [total, reviews] = await Promise.all([
    db.review.count({ where: { listing_id: BigInt(propertyId), is_active: true } }),
    db.review.findMany({
      where: { listing_id: BigInt(propertyId), is_active: true },
      include: { reviewer: { select: { id: true, email: true } } },
      orderBy: { created_date: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const agg = await db.review.aggregate({
    where: { listing_id: BigInt(propertyId), is_active: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  // Format the reviews to match previous structure for frontend compatibility
  const formattedReviews = reviews.map(r => ({
    ...r,
    user: r.reviewer, // Map reviewer to user property
  }))

  sendSuccess(res, {
    reviews: formattedReviews,
    total,
    average_rating: agg._avg?.rating ? parseFloat(agg._avg.rating.toFixed(1)) : null,
    total_reviews: total,
  })
})

// POST /reviews/property/:propertyId
reviewsRouter.post(
  '/property/:propertyId',
  requireAuth,
  validate({ body: createSchema }),
  async (req, res) => {
    const propertyId = String(req.params.propertyId)
    const property = await db.listListing.findUnique({ where: { id: BigInt(propertyId) } })
    if (!property) throw new NotFoundError('Property')

    let review = await db.review.findFirst({
      where: {
        reviewed_by_user_id: req.user!.id,
        listing_id: BigInt(propertyId),
        is_active: true
      }
    })

    let resultReview
    if (review) {
      resultReview = await db.review.update({
        where: { id: review.id },
        data: {
          rating: req.body.rating,
          comment: req.body.comment,
        },
        include: { reviewer: { select: { id: true, email: true } } },
      })
    } else {
      resultReview = await db.review.create({
        data: {
          reviewed_by_user_id: req.user!.id,
          reviewed_entity_type: 'Listing',
          reviewed_entity_id: BigInt(propertyId),
          listing_id: BigInt(propertyId),
          rating: req.body.rating,
          comment: req.body.comment,
        },
        include: { reviewer: { select: { id: true, email: true } } },
      })
    }

    sendCreated(res, { ...resultReview, user: resultReview.reviewer }, 'Review submitted')
  }
)

// DELETE /reviews/:id
reviewsRouter.delete('/:id', requireAuth, async (req, res) => {
  const reviewId = String(req.params.id)
  const review = await db.review.findUnique({ where: { id: BigInt(reviewId) } })
  if (!review) throw new NotFoundError('Review')

  if (review.reviewed_by_user_id !== req.user!.id) {
    throw new ForbiddenError('You can only delete your own reviews')
  }

  await db.review.update({ where: { id: BigInt(reviewId) }, data: { is_active: false } })
  sendNoContent(res)
})
