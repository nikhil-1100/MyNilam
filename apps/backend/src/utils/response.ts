/**
 * Standard API Response Helpers
 * 
 * Every endpoint returns through these helpers to ensure
 * a consistent response envelope across the entire API.
 * 
 * Success shape:
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "...",
 *   "pagination": { ... }
 * }
 * 
 * Error shape:
 * {
 *   "success": false,
 *   "error": { "code": "...", "message": "...", "errors": {...} },
 *   "requestId": "..."
 * }
 */
import type { Response } from 'express'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  pagination?: PaginationMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    errors?: Record<string, string[]>
  }
  requestId?: string
}

/**
 * Send a 200 OK success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  }
  res.status(statusCode).json(body)
}

/**
 * Send a 201 Created response
 */
export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message ?? 'Created successfully', 201)
}

/**
 * Send a 204 No Content response
 */
export function sendNoContent(res: Response): void {
  res.status(204).send()
}

/**
 * Send a paginated list response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
): void {
  const body: ApiSuccessResponse<T[]> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
  }
  res.status(200).json(body)
}

/**
 * Build pagination metadata from query params + total count
 */
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize)
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

/**
 * Parse and clamp pagination query params
 */
export function parsePagination(
  query: Record<string, unknown>,
  maxPageSize = 100,
): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1)
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, parseInt(String(query.page_size ?? '10'), 10) || 10),
  )
  const skip = (page - 1) * pageSize
  return { page, pageSize, skip }
}
