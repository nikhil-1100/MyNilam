/**
 * Hostel Service
 */
import { hostelRepository } from '../repositories/hostel.repository'
import { NotFoundError, ForbiddenError } from '../utils/errors'
import { cacheGet, cacheSet, cacheDel, CacheKeys } from '../config/redis'
import type { HostelConfigInput, HostelPricingInput, HostelVacancyInput } from '../validators/hostel.validator'

export const hostelService = {
  async getMyHostel(userId: string, userRole: string) {
    const hostel = await hostelRepository.findByAdminUserId(userId)
    if (!hostel && userRole !== 'SUPER_ADMIN') throw new NotFoundError('Hostel')
    return hostel
  },

  async getConfig(hostelId: string) {
    const cached = await cacheGet(CacheKeys.hostelConfig(hostelId))
    if (cached) return cached

    const hostel = await hostelRepository.findById(hostelId)
    if (!hostel) throw new NotFoundError('Hostel')

    await cacheSet(CacheKeys.hostelConfig(hostelId), hostel, 300)
    return hostel
  },

  async updateConfig(propertyId: string, data: HostelConfigInput, userId: string, userRole: string) {
    const hostel = await hostelRepository.findByPropertyId(propertyId)

    // Check ownership for hostel_admin
    if (userRole === 'HOSTEL_ADMIN') {
      const user = await import('../config/database').then((m) => m.db.authUser.findUnique({
        where: { id: BigInt(userId) },
        select: { id: true },
      }))
      // Custom RBAC verification can be added here
    }

    const updated = await hostelRepository.upsert(propertyId, data)
    if (updated?.id) await cacheDel(CacheKeys.hostelConfig(String(updated.id)))
    return updated
  },

  async getPricing(hostelId: string) {
    const hostel = await hostelRepository.findById(hostelId)
    if (!hostel) throw new NotFoundError('Hostel')
    return hostel.pricing
  },

  async updatePricing(hostelId: string, input: HostelPricingInput) {
    const hostel = await hostelRepository.findById(hostelId)
    if (!hostel) throw new NotFoundError('Hostel')

    const updated = await hostelRepository.updatePricing(hostelId, input)
    await cacheDel(CacheKeys.hostelConfig(hostelId))
    return updated
  },

  async updateVacancy(hostelId: string, data: HostelVacancyInput) {
    const hostel = await hostelRepository.findById(hostelId)
    if (!hostel) throw new NotFoundError('Hostel')

    const updated = await hostelRepository.updateVacancy(hostelId, data)
    await cacheDel(CacheKeys.hostelConfig(hostelId))
    return updated
  },
}

