/**
 * Users Routes (Aligned with 21-Module Schema)
 */
import { Router } from 'express'
import { db } from '../config/database'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware'
import { sendSuccess } from '../utils/response'
import { NotFoundError } from '../utils/errors'

export const usersRouter = Router()

// GET /users/me/profile — own extended profile (must be before /:id routes)
usersRouter.get('/me/profile', requireAuth, async (req, res) => {
  const user = await db.authUser.findUnique({
    where: { id: req.user!.id },
    include: { profile: true },
  })
  sendSuccess(res, user)
})

// GET /users/me/search-history
usersRouter.get('/me/search-history', requireAuth, async (req, res) => {
  const history = await db.searchHistory.findMany({
    where: { user_id: req.user!.id },
    orderBy: { created_at: 'desc' },
    take: 20,
  })
  sendSuccess(res, history)
})

// DELETE /users/me/search-history
usersRouter.delete('/me/search-history', requireAuth, async (req, res) => {
  await db.searchHistory.deleteMany({ where: { user_id: req.user!.id } })
  sendSuccess(res, null, 'Search history cleared')
})

// GET /users/:id/profile — public profile
usersRouter.get('/:id/profile', optionalAuth, async (req, res) => {
  const userId = String(req.params.id)
  const user = await db.authUser.findFirst({
    where: { id: BigInt(userId), is_active: true, is_deleted: false },
    select: {
      id: true,
      email: true,
      created_date: true,
      profile: { select: { bio: true } },
      _count: { select: { listings: true } },
    },
  })
  if (!user) throw new NotFoundError('User')
  sendSuccess(res, user)
})

// GET /users/:id/listings — public listings by user
usersRouter.get('/:id/listings', optionalAuth, async (req, res) => {
  const userId = String(req.params.id)
  const listings = await db.listListing.findMany({
    where: { user_id: BigInt(userId), status: 'Published', is_deleted: false },
    include: {
      media_assets: { take: 1, orderBy: { display_order: 'asc' } },
      _count: { select: { favorites: true } },
    },
    orderBy: { created_date: 'desc' },
  })
  sendSuccess(res, listings)
})
