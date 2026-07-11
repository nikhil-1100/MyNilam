/**
 * Hostel Validators
 */
import { z } from 'zod'

const sharingEnum = z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'DORM'])
const genderTypeEnum = z.enum(['BOYS', 'GIRLS', 'UNISEX'])

export const hostelConfigSchema = z.object({
  name: z.string().min(2).max(200),
  total_bed_spaces: z.coerce.number().int().positive(),
  total_rooms: z.coerce.number().int().positive(),
  bathroom_count: z.coerce.number().int().positive(),
  attached_bathrooms: z.boolean().default(false),
  gender_type: genderTypeEnum.default('UNISEX'),
  wifi_enabled: z.boolean().default(false),
  wifi_speed: z.string().optional(),
  hot_water: z.boolean().default(false),
  water_filter: z.boolean().default(false),
  mess_food: z.boolean().default(false),
  laundry_enabled: z.boolean().default(false),
  ac_available: z.boolean().default(false),
  water_source: z.string().optional(),
  vacant_beds: z.coerce.number().int().min(0).default(0),
  vacant_rooms: z.coerce.number().int().min(0).default(0),
  vacant_sharings: z.array(z.string()).default([]),
  allowed_sharings: z.array(z.string()).default([]),
})

export const hostelPricingSchema = z.object({
  pricing: z.array(
    z.object({
      share_type: sharingEnum,
      price: z.coerce.number().int().positive(),
    })
  ).min(1),
})

export const hostelVacancySchema = z.object({
  vacant_beds: z.coerce.number().int().min(0),
  vacant_rooms: z.coerce.number().int().min(0),
  vacant_sharings: z.array(z.string()).default([]),
})

export type HostelConfigInput = z.infer<typeof hostelConfigSchema>
export type HostelPricingInput = z.infer<typeof hostelPricingSchema>
export type HostelVacancyInput = z.infer<typeof hostelVacancySchema>
