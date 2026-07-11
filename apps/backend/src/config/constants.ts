/**
 * Application Constants
 * 
 * Centralized place for all magic numbers and string constants.
 * Never hardcode these inline — always reference from here.
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

// Property
export const PROPERTY = {
  MAX_IMAGES: 10,
  MAX_VIDEOS: 3,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 50,
  COVER_IMAGE_INDEX: 0,
  VIEW_COUNT_DEBOUNCE_MINUTES: 30,
  TRENDING_WINDOW_DAYS: 7,
  FEATURED_CACHE_TTL_SECONDS: 300,    // 5 minutes
  TRENDING_CACHE_TTL_SECONDS: 600,   // 10 minutes
  DETAIL_CACHE_TTL_SECONDS: 60,       // 1 minute
} as const

// Auth
export const AUTH = {
  REFRESH_TOKEN_LENGTH: 64,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_RESET_EXPIRES_MINUTES: 30,
  EMAIL_VERIFY_EXPIRES_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
} as const

// Search
export const SEARCH = {
  MAX_RADIUS_KM: 50,
  DEFAULT_RADIUS_KM: 10,
  SEARCH_CACHE_TTL_SECONDS: 30,
  RECENTLY_VIEWED_MAX: 20,
  SEARCH_HISTORY_MAX: 20,
} as const

// Cache TTL
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
} as const

// File upload allowed types (magic bytes + MIME)
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY = {
  guest: 0,
  normal: 1,
  employee: 2,
  hostel_admin: 2,
  super_admin: 3,
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  PROPERTY_VERIFIED: 'PROPERTY_VERIFIED',
  PROPERTY_REJECTED: 'PROPERTY_REJECTED',
  NEW_INQUIRY: 'NEW_INQUIRY',
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_REVIEW: 'NEW_REVIEW',
  VISIT_CONFIRMED: 'VISIT_CONFIRMED',
  VISIT_CANCELLED: 'VISIT_CANCELLED',
  SYSTEM: 'SYSTEM',
} as const

// Storage paths
export const STORAGE_PATHS = {
  propertyImage: (propertyId: string, filename: string) =>
    `properties/${propertyId}/images/${filename}`,
  propertyVideo: (propertyId: string, filename: string) =>
    `properties/${propertyId}/videos/${filename}`,
  avatar: (userId: string, filename: string) =>
    `avatars/${userId}/${filename}`,
} as const
