import { db } from '../config/database'
import { Prisma } from '@prisma/client'
import type { CreatePropertyInput, UpdatePropertyInput, PropertyFiltersInput } from '../validators/property.validator'

// Include shape for full listing with relations
export const propertyInclude = {
  user: { select: { id: true, email: true } },
  media_assets: { orderBy: { display_order: 'asc' as const } },
} satisfies Prisma.ListListingInclude

export const propertyRepository = {
  async findAll(filters: PropertyFiltersInput) {
    const {
      page, page_size, city, state, property_type, listing_type,
      min_price, max_price, bedrooms, bathrooms,
      search, sort_by,
    } = filters

    const where: Prisma.ListListingWhereInput = {
      status: 'Published',
      is_published: true,
      is_deleted: false,
      ...(bedrooms !== undefined && { bedrooms }),
      ...(bathrooms !== undefined && { bathrooms }),
      ...(city && {
        locality: {
          area: {
            city: {
              name: { equals: city, mode: 'insensitive' }
            }
          }
        }
      }),
      ...(state && {
        locality: {
          area: {
            city: {
              district: {
                state: {
                  name: { equals: state, mode: 'insensitive' }
                }
              }
            }
          }
        }
      }),
      ...(min_price !== undefined && { price: { gte: min_price } }),
      ...(max_price !== undefined && { price: { lte: max_price } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const orderBy: Prisma.ListListingOrderByWithRelationInput =
      sort_by === 'price_low' ? { price: 'asc' }
      : sort_by === 'price_high' ? { price: 'desc' }
      : sort_by === 'views' ? { view_count: 'desc' }
      : { created_date: 'desc' }

    const skip = (page - 1) * page_size

    const [total, results] = await Promise.all([
      db.listListing.count({ where }),
      db.listListing.findMany({ where, include: propertyInclude, orderBy, skip, take: page_size }),
    ])

    return { total, results }
  },

  async findById(id: string) {
    return db.listListing.findFirst({
      where: { id: BigInt(id), is_deleted: false },
      include: {
        ...propertyInclude,
        _count: { select: { favorites: true, reviews: true } },
      },
    })
  },

  async findByUser(userId: string) {
    return db.listListing.findMany({
      where: { user_id: BigInt(userId), is_deleted: false },
      include: propertyInclude,
      orderBy: { created_date: 'desc' },
    })
  },

  async findFeatured(limit = 8) {
    return db.listListing.findMany({
      where: { is_featured: true, status: 'Published', is_published: true, is_deleted: false },
      include: propertyInclude,
      orderBy: { created_date: 'desc' },
      take: limit,
    })
  },

  async findTrending(limit = 8) {
    return db.listListing.findMany({
      where: { status: 'Published', is_published: true, is_deleted: false },
      include: propertyInclude,
      orderBy: { view_count: 'desc' },
      take: limit,
    })
  },

  async findNearby(lat: number, lng: number, radiusKm: number, page: number, pageSize: number) {
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

    const where: Prisma.ListListingWhereInput = {
      status: 'Published',
      is_published: true,
      is_deleted: false,
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    }

    const skip = (page - 1) * pageSize

    const [total, results] = await Promise.all([
      db.listListing.count({ where }),
      db.listListing.findMany({ where, include: propertyInclude, skip, take: pageSize }),
    ])

    return { total, results }
  },

  async create(data: CreatePropertyInput, userId: string) {
    // Generate slug from title
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

    return db.listListing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        purpose: data.listing_type,
        // Map property_type (or custom categories if applicable)
        category: {
          connectOrCreate: {
            where: { name: data.property_type },
            create: {
              name: data.property_type,
              slug: data.property_type.toLowerCase(),
              listing_type: 'Property'
            }
          }
        },
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area_sqft,
        street_address: data.address,
        zip_code: data.zip_code,
        latitude: data.latitude,
        longitude: data.longitude,
        user: { connect: { id: BigInt(userId) } },
        slug,
        status: 'Draft',
        is_published: false,
      },
      include: propertyInclude,
    })
  },

  async update(id: string, data: UpdatePropertyInput) {
    return db.listListing.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        street_address: data.address,
      },
      include: propertyInclude,
    })
  },

  async softDelete(id: string) {
    return db.listListing.update({
      where: { id: BigInt(id) },
      data: { is_deleted: true, status: 'Archived', is_published: false },
    })
  },

  async publish(id: string, verifierId: string) {
    return db.listListing.update({
      where: { id: BigInt(id) },
      data: {
        status: 'Published',
        is_published: true,
        // Map verified_by (if applicable)
        // verified_by_id: verifierId,
        // verified_at: new Date(),
      },
    })
  },

  async reject(id: string, reason: string, verifierId: string) {
    return db.listListing.update({
      where: { id: BigInt(id) },
      data: {
        status: 'Rejected',
        is_published: false,
        // Map verified_by & rejection_reason if needed
      },
    })
  },

  async incrementViewCount(id: string) {
    await db.listListing.update({ where: { id: BigInt(id) }, data: { view_count: { increment: 1 } } })
  },

  async addImage(data: { property_id: string; url: string; storage_path: string; is_cover: boolean; order_index: number }) {
    return db.mediaAsset.create({
      data: {
        listing_id: BigInt(data.property_id),
        file_name: data.storage_path,
        storage_path: data.url,
        is_primary: data.is_cover,
        display_order: data.order_index,
        asset_type: 'Image',
      }
    })
  },

  async deleteImage(imageId: string) {
    return db.mediaAsset.delete({ where: { id: BigInt(imageId) } })
  },

  async findImageById(imageId: string) {
    return db.mediaAsset.findUnique({ where: { id: BigInt(imageId) } })
  },

  async findUnpublished() {
    return db.listListing.findMany({
      where: { status: { in: ['Draft', 'Submitted'] }, is_deleted: false },
      include: propertyInclude,
      orderBy: { created_date: 'asc' },
    })
  },

  async recordView(data: { property_id: string; user_id?: string; ip_address?: string; user_agent?: string }) {
    return db.anlytListingView.create({
      data: {
        listing_id: BigInt(data.property_id),
        user_id: data.user_id ? BigInt(data.user_id) : null,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      }
    })
  },
}
