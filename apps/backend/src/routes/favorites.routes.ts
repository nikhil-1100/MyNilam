import { Router } from 'express'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { sendSuccess, sendNoContent } from '../utils/response'
import { NotFoundError } from '../utils/errors'

export const favoritesRouter = Router()
favoritesRouter.use(requireAuth)

// GET /favorites — list user's saved properties
favoritesRouter.get('/', async (req, res) => {
  const favorites = await db.favorite.findMany({
    where: { user_id: req.user!.id },
    include: {
      property: {
        include: {
          media_assets: { take: 1, orderBy: { display_order: 'asc' } },
          user: { select: { id: true, email: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  // Format listings output
  const listings = favorites.map((f: any) => ({
    ...f.property,
    id: f.property.id.toString(),
    user: {
      id: f.property.user.id.toString(),
      email: f.property.user.email
    },
    images: f.property.media_assets.map((img: any) => ({
      id: img.id.toString(),
      url: img.storage_path
    }))
  }))

  sendSuccess(res, listings)
})

// POST /favorites/:propertyId — save a property
favoritesRouter.post('/:propertyId', async (req, res) => {
  const propertyId = req.params.propertyId
  const property = await db.listListing.findUnique({ where: { id: BigInt(propertyId) } })
  if (!property) throw new NotFoundError('Property')

  const favorite = await db.favorite.upsert({
    where: {
      user_id_property_id: {
        user_id: req.user!.id,
        property_id: BigInt(propertyId)
      }
    },
    create: {
      user_id: req.user!.id,
      property_id: BigInt(propertyId)
    },
    update: {},
  })
  sendSuccess(res, { ...favorite, id: favorite.id.toString(), user_id: favorite.user_id.toString(), property_id: favorite.property_id.toString() }, 'Property saved to favorites')
})

// DELETE /favorites/:propertyId — remove from favorites
favoritesRouter.delete('/:propertyId', async (req, res) => {
  const propertyId = req.params.propertyId
  await db.favorite.deleteMany({
    where: {
      user_id: req.user!.id,
      property_id: BigInt(propertyId)
    },
  })
  sendNoContent(res)
})

// GET /favorites/check/:propertyId — check if saved
favoritesRouter.get('/check/:propertyId', async (req, res) => {
  const propertyId = req.params.propertyId
  const favorite = await db.favorite.findUnique({
    where: {
      user_id_property_id: {
        user_id: req.user!.id,
        property_id: BigInt(propertyId)
      }
    },
  })
  sendSuccess(res, { is_saved: !!favorite })
})
