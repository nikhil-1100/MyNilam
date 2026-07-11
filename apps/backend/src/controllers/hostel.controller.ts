/**
 * Hostel Controller
 */
import type { Request, Response } from 'express'
import { hostelService } from '../services/hostel.service'
import { sendSuccess } from '../utils/response'

export const hostelController = {
  async getMyHostel(req: Request, res: Response) {
    const hostel = await hostelService.getMyHostel(String(req.user!.id), 'normal')
    sendSuccess(res, hostel)
  },

  async getConfig(req: Request, res: Response) {
    const hostel = await hostelService.getConfig(String(req.params.hostelId))
    sendSuccess(res, hostel)
  },

  async updateConfig(req: Request, res: Response) {
    const hostel = await hostelService.updateConfig(
      String(req.params.propertyId), req.body, String(req.user!.id), 'normal'
    )
    sendSuccess(res, hostel, 'Hostel configuration updated')
  },

  async getPricing(req: Request, res: Response) {
    const pricing = await hostelService.getPricing(String(req.params.hostelId))
    sendSuccess(res, pricing)
  },

  async updatePricing(req: Request, res: Response) {
    const result = await hostelService.updatePricing(String(req.params.hostelId), req.body)
    sendSuccess(res, result, 'Pricing updated successfully')
  },

  async updateVacancy(req: Request, res: Response) {
    const result = await hostelService.updateVacancy(String(req.params.hostelId), req.body)
    sendSuccess(res, result, 'Vacancy updated successfully')
  },
}
