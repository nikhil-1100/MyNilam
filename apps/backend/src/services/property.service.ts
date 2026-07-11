/**
 * Property Service — Business logic layer
 */
import { propertyRepository } from '../repositories/property.repository'
import { cacheGet, cacheSet, cacheDel, CacheKeys } from '../config/redis'
import { PROPERTY } from '../config/constants'
import { NotFoundError, ForbiddenError } from '../utils/errors'
import { logger } from '../utils/logger'
import type { CreatePropertyInput, UpdatePropertyInput, PropertyFiltersInput } from '../validators/property.validator'

export const propertyService = {
  async list(filters: PropertyFiltersInput) {
    return propertyRepository.findAll(filters)
  },

  async getById(id: string, meta?: { userId?: string; ip?: string; userAgent?: string }) {
    // Try cache first
    const cached = await cacheGet(CacheKeys.propertyDetail(id))
    if (cached) return cached

    const property = await propertyRepository.findById(id)
    if (!property) throw new NotFoundError('Property')

    // Increment view count asynchronously
    propertyRepository.incrementViewCount(id).catch(() => {})

    // Cache the result
    await cacheSet(CacheKeys.propertyDetail(id), property, PROPERTY.DETAIL_CACHE_TTL_SECONDS)

    return property
  },

  async getFeatured() {
    const cached = await cacheGet(CacheKeys.featuredProperties())
    if (cached) return cached

    const results = await propertyRepository.findFeatured(8)
    await cacheSet(CacheKeys.featuredProperties(), results, PROPERTY.FEATURED_CACHE_TTL_SECONDS)
    return results
  },

  async getTrending() {
    const cached = await cacheGet(CacheKeys.trendingProperties())
    if (cached) return cached

    const results = await propertyRepository.findTrending(8)
    await cacheSet(CacheKeys.trendingProperties(), results, PROPERTY.TRENDING_CACHE_TTL_SECONDS)
    return results
  },

  async getNearby(lat: number, lng: number, radiusKm: number, page: number, pageSize: number) {
    return propertyRepository.findNearby(lat, lng, radiusKm, page, pageSize)
  },

  async getMyListings(userId: string) {
    return propertyRepository.findByUser(userId)
  },

  async create(data: CreatePropertyInput, userId: string) {
    const property = await propertyRepository.create(data, userId)
    logger.info({ propertyId: property.id, userId }, 'Property created (pending review)')
    return property
  },

  async update(id: string, data: UpdatePropertyInput, userId: string, userRole: string) {
    const property = await propertyRepository.findById(id)
    if (!property) throw new NotFoundError('Property')

    if (String(property.user_id) !== userId && userRole !== 'SUPER_ADMIN' && userRole !== 'EMPLOYEE') {
      throw new ForbiddenError('You can only edit your own properties')
    }

    const updated = await propertyRepository.update(id, data)
    await cacheDel(CacheKeys.propertyDetail(id))
    return updated
  },

  async delete(id: string, userId: string, userRole: string) {
    const property = await propertyRepository.findById(id)
    if (!property) throw new NotFoundError('Property')

    if (String(property.user_id) !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenError('You can only delete your own properties')
    }

    await propertyRepository.softDelete(id)
    await cacheDel(CacheKeys.propertyDetail(id))
    logger.info({ propertyId: id, userId }, 'Property deleted')
  },

  async publish(id: string, verifierId: string) {
    const property = await propertyRepository.findById(id)
    if (!property) throw new NotFoundError('Property')

    const updated = await propertyRepository.publish(id, verifierId)
    await cacheDel(CacheKeys.propertyDetail(id))
    logger.info({ propertyId: id, verifierId }, 'Property published')
    return updated
  },

  async reject(id: string, reason: string, verifierId: string) {
    const property = await propertyRepository.findById(id)
    if (!property) throw new NotFoundError('Property')

    const updated = await propertyRepository.reject(id, reason, verifierId)
    await cacheDel(CacheKeys.propertyDetail(id))
    logger.info({ propertyId: id, verifierId }, 'Property rejected')
    return updated
  },

  async getPending() {
    return propertyRepository.findUnpublished()
  },
}
