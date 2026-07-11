/**
 * Geolocation Utilities
 * 
 * Haversine formula for calculating distances between lat/lng coordinates.
 * Used for "nearby properties" search feature.
 */

const EARTH_RADIUS_KM = 6371

/**
 * Calculate the distance in km between two lat/lng points
 * using the Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Calculate bounding box for a lat/lng + radius search.
 * Used to pre-filter with a simple WHERE clause before
 * applying the precise Haversine calculation.
 * 
 * Returns { minLat, maxLat, minLon, maxLon }
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number,
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI)
  const lonDelta = radiusKm / (EARTH_RADIUS_KM * Math.cos(toRad(lat))) * (180 / Math.PI)

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  }
}
