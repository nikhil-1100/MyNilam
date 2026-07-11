/**
 * Property Controller (Aligned with 21-Module Schema)
 */
import type { Request, Response } from 'express'
import { propertyService } from '../services/property.service'
import { sendSuccess, sendCreated, sendNoContent, sendPaginated, buildPaginationMeta } from '../utils/response'
import type { PropertyFiltersInput } from '../validators/property.validator'

export const propertyController = {
  async list(req: Request, res: Response) {
    const filters = req.query as unknown as PropertyFiltersInput
    const { total, results } = await propertyService.list(filters)
    const pagination = buildPaginationMeta(filters.page, filters.page_size, total)

    // Format results to serialize BigInt properties for the client
    const formatted = results.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))

    sendPaginated(res, formatted, pagination)
  },

  async getById(req: Request, res: Response) {
    const property = await propertyService.getById(String(req.params.id), {
      userId: req.user?.id ? String(req.user.id) : undefined,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }) as any

    // Format detail properties
    const formatted = {
      ...property,
      id: property.id.toString(),
      user_id: property.user_id.toString(),
      images: property.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }

    sendSuccess(res, formatted)
  },

  async getFeatured(_req: Request, res: Response) {
    const data = await propertyService.getFeatured() as any[]
    const formatted = data.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))
    sendSuccess(res, formatted)
  },

  async getTrending(_req: Request, res: Response) {
    const data = await propertyService.getTrending() as any[]
    const formatted = data.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))
    sendSuccess(res, formatted)
  },

  async getNearby(req: Request, res: Response) {
    const lat = parseFloat(String(req.query.lat))
    const lng = parseFloat(String(req.query.lng))
    const radius = parseFloat(String(req.query.radius ?? '10'))
    const page = parseInt(String(req.query.page ?? '1'))
    const pageSize = parseInt(String(req.query.page_size ?? '10'))

    const data = await propertyService.getNearby(lat, lng, radius, page, pageSize) as any
    const pagination = buildPaginationMeta(page, pageSize, data.total)

    const formatted = data.results.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))

    sendPaginated(res, formatted, pagination)
  },

  async getMyListings(req: Request, res: Response) {
    const data = await propertyService.getMyListings(String(req.user!.id)) as any[]
    const formatted = data.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))
    sendSuccess(res, formatted)
  },

  async getPending(_req: Request, res: Response) {
    const data = await propertyService.getPending() as any[]
    const formatted = data.map((p: any) => ({
      ...p,
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      images: p.media_assets.map((img: any) => ({
        id: img.id.toString(),
        url: img.storage_path
      }))
    }))
    sendSuccess(res, formatted)
  },

  async create(req: Request, res: Response) {
    const property = await propertyService.create(req.body, String(req.user!.id)) as any
    const formatted = {
      ...property,
      id: property.id.toString(),
      user_id: property.user_id.toString(),
    }
    sendCreated(res, formatted, 'Property submitted for review')
  },

  async update(req: Request, res: Response) {
    const property = await propertyService.update(String(req.params.id), req.body, String(req.user!.id), 'normal') as any
    const formatted = {
      ...property,
      id: property.id.toString(),
      user_id: property.user_id.toString(),
    }
    sendSuccess(res, formatted, 'Property updated')
  },

  async delete(req: Request, res: Response) {
    await propertyService.delete(String(req.params.id), String(req.user!.id), 'normal')
    sendNoContent(res)
  },

  async publish(req: Request, res: Response) {
    const property = await propertyService.publish(String(req.params.id), String(req.user!.id)) as any
    const formatted = {
      ...property,
      id: property.id.toString(),
    }
    sendSuccess(res, formatted, 'Property published successfully')
  },

  async reject(req: Request, res: Response) {
    const property = await propertyService.reject(String(req.params.id), req.body.reason, String(req.user!.id)) as any
    const formatted = {
      ...property,
      id: property.id.toString(),
    }
    sendSuccess(res, formatted, 'Property rejected')
  },
}
