import { db } from '../config/database'
import type { HostelConfigInput, HostelPricingInput, HostelVacancyInput } from '../validators/hostel.validator'

export const hostelRepository = {
  async findByPropertyId(propertyId: string) {
    return db.hostel.findUnique({
      where: { property_id: BigInt(propertyId) },
      include: {
        pricing: true,
        property: {
          include: {
            media_assets: {
              take: 1
            }
          }
        }
      },
    })
  },

  async findById(id: string) {
    return db.hostel.findUnique({
      where: { id: BigInt(id) },
      include: { pricing: true },
    })
  },

  async findByAdminUserId(userId: string) {
    const user = await db.authUser.findUnique({
      where: { id: BigInt(userId) },
      include: {
        assigned_hostel: {
          include: {
            pricing: true,
            property: {
              include: {
                media_assets: {
                  take: 1
                }
              }
            }
          }
        }
      }
    })
    return user?.assigned_hostel || null
  },

  async upsert(propertyId: string, data: HostelConfigInput) {
    const createData = {
      property_id: BigInt(propertyId),
      name: 'Hostel Name',
      total_bed_spaces: data.total_bed_spaces || 0,
      total_rooms: data.total_rooms || 0,
      bathroom_count: data.bathroom_count || 0,
      attached_bathrooms: data.attached_bathrooms || false,
    }

    return db.hostel.upsert({
      where: { property_id: BigInt(propertyId) },
      create: createData,
      update: {
        total_bed_spaces: data.total_bed_spaces,
        total_rooms: data.total_rooms,
        bathroom_count: data.bathroom_count,
        attached_bathrooms: data.attached_bathrooms,
      },
      include: { pricing: true },
    })
  },

  async updatePricing(hostelId: string, input: HostelPricingInput) {
    await db.hostelPricing.deleteMany({ where: { hostel_id: BigInt(hostelId) } })
    await db.hostelPricing.createMany({
      data: input.pricing.map((p) => ({
        hostel_id: BigInt(hostelId),
        share_type: p.share_type,
        price: p.price,
      })),
    })
    return db.hostel.findUnique({ where: { id: BigInt(hostelId) }, include: { pricing: true } })
  },

  async updateVacancy(hostelId: string, data: HostelVacancyInput) {
    return db.hostel.update({
      where: { id: BigInt(hostelId) },
      data: {
        vacant_beds: data.vacant_beds,
        vacant_rooms: data.vacant_rooms,
      },
      include: { pricing: true },
    })
  },
}
