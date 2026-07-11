/**
 * Property Validators (Zod)
 */
import { z } from 'zod'

const propertyTypeEnum = z.enum(['HOUSE', 'FLAT', 'PLOT', 'COMMERCIAL', 'HOSTEL', 'PG'])
const listingTypeEnum = z.enum(['SALE', 'RENT', 'ROOMMATE'])
const genderPrefEnum = z.enum(['ANY', 'MALE', 'FEMALE'])
const sharingEnum = z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'DORM'])

export const createPropertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().positive(),
  property_type: propertyTypeEnum,
  listing_type: listingTypeEnum,
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).optional(),
  area_sqft: z.coerce.number().positive().optional(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zip_code: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  is_furnished: z.boolean().optional(),
  furniture_list: z.array(z.string()).optional(),
  total_rooms: z.coerce.number().int().positive().optional(),
  num_beds: z.coerce.number().int().positive().optional(),
  is_upstairs: z.boolean().optional(),
  water_source: z.string().optional(),
  power_backup: z.string().optional(),
  parking: z.string().optional(),
  gated_community: z.boolean().optional(),
  security_features: z.array(z.string()).optional(),
  preferred_tenant: z.string().optional(),
  preferred_gender: genderPrefEnum.optional(),
  sharing_occupancy: sharingEnum.optional(),
  food_included: z.boolean().optional(),
  wifi_available: z.boolean().optional(),
  ac_available: z.boolean().optional(),
  laundry_available: z.boolean().optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

export const propertyFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
  city: z.string().optional(),
  state: z.string().optional(),
  property_type: propertyTypeEnum.optional(),
  listing_type: listingTypeEnum.optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().optional(),
  bathrooms: z.coerce.number().int().optional(),
  is_furnished: z.coerce.boolean().optional(),
  preferred_gender: genderPrefEnum.optional(),
  search: z.string().optional(),
  sort_by: z.enum(['newest', 'price_low', 'price_high', 'views']).default('newest'),
})

export const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(10),
})

export const rejectPropertySchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type PropertyFiltersInput = z.infer<typeof propertyFiltersSchema>
