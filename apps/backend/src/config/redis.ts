/**
 * Redis Client
 * 
 * Used for caching (featured, trending, recently viewed).
 * Falls back gracefully — app runs without Redis in development.
 */
import Redis from 'ioredis'
import { env } from './environment'

let redisClient: Redis | null = null
let isRedisDisabled = false

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 1) return null // Stop retrying
        return 100
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    redisClient.on('connect', () => console.log('✅  Redis connected'))
    redisClient.on('error', (e) => {
      if (!isRedisDisabled) {
        console.warn('⚠️  Redis error:', e.message)
      }
    })
  }
  return redisClient
}

export async function connectRedis(): Promise<void> {
  try {
    await getRedis().connect()
  } catch {
    console.warn('⚠️  Redis unavailable — caching disabled')
    isRedisDisabled = true
    if (redisClient) {
      redisClient.disconnect()
      redisClient = null
    }
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// ---- Cache helpers (graceful degradation) ----

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (isRedisDisabled) return null
  try {
    const v = await getRedis().get(key)
    return v ? (JSON.parse(v) as T) : null
  } catch { return null }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (isRedisDisabled) return
  try { await getRedis().setex(key, ttlSeconds, JSON.stringify(value)) } catch { }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (isRedisDisabled) return
  try { if (keys.length) await getRedis().del(...keys) } catch { }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (isRedisDisabled) return
  try {
    const keys = await getRedis().keys(pattern)
    if (keys.length) await getRedis().del(...keys)
  } catch { }
}

export const CacheKeys = {
  featuredProperties: () => 'properties:featured',
  trendingProperties: () => 'properties:trending',
  propertyDetail: (id: string) => `properties:detail:${id}`,
  userProfile: (id: string) => `users:profile:${id}`,
  hostelConfig: (id: string) => `hostel:config:${id}`,
  recentlyViewed: (userId: string) => `users:recently-viewed:${userId}`,
  searchResults: (hash: string) => `search:${hash}`,
} as const
