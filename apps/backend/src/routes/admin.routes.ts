import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { sendSuccess, sendNoContent } from '../utils/response'
import { NotFoundError, ConflictError } from '../utils/errors'
import { hashPassword } from '../utils/password'

export const adminRouter = Router()
adminRouter.use(requireAuth)
adminRouter.use(requireRole('SUPER_ADMIN', 'EMPLOYEE'))

const addEmployeeSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  password: z.string().min(8),
  phone: z.string().optional(),
})

const updateRoleSchema = z.object({
  role: z.string(),
})

const createHostelAdminSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  password: z.string().min(8),
  property_id: z.string(),
})

// GET /admin/stats
adminRouter.get('/stats', async (_req, res) => {
  const [totalUsers, totalProps, published, pending, messages, inquiries] = await Promise.all([
    db.authUser.count({ where: { is_deleted: false } }),
    db.listListing.count({ where: { is_deleted: false } }),
    db.listListing.count({ where: { status: 'Published' } }),
    db.listListing.count({ where: { status: 'Draft' } }),
    db.message.count({ where: { is_deleted: false } }),
    db.inquiry.count(),
  ])
  sendSuccess(res, {
    users: totalUsers,
    properties: { total: totalProps, published, pending },
    messages,
    inquiries,
  })
})

// GET /admin/users
adminRouter.get('/users', async (req, res) => {
  const page = parseInt(String(req.query.page ?? '1'))
  const search = req.query.search ? String(req.query.search) : undefined
  const pageSize = 20

  const where: Prisma.AuthUserWhereInput = {
    is_deleted: false,
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [total, users] = await Promise.all([
    db.authUser.count({ where }),
    db.authUser.findMany({
      where,
      select: {
        id: true,
        email: true,
        is_active: true,
        created_date: true,
        role: true,
        profile: { select: { display_name: true } },
        _count: { select: { listings: true } },
      },
      orderBy: { created_date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  // Map to structure expected by frontend
  const formattedUsers = users.map(u => ({
    id: u.id.toString(),
    email: u.email,
    is_active: u.is_active,
    created_at: u.created_date,
    role: u.role,
    full_name: u.profile?.display_name || '',
    properties_count: u._count.listings,
  }))

  sendSuccess(res, { users: formattedUsers, total })
})

// GET /admin/users/:id
adminRouter.get('/users/:id', async (req, res) => {
  const userId = req.params.id
  const user = await db.authUser.findUnique({
    where: { id: BigInt(userId) },
    include: {
      profile: true,
      _count: { select: { listings: true, reviews: true, favorites: true } },
    },
  })
  if (!user) throw new NotFoundError('User')

  // Format user output
  const formatted = {
    id: user.id.toString(),
    email: user.email,
    is_active: user.is_active,
    role: user.role,
    created_at: user.created_date,
    profile: user.profile,
    _count: {
      properties: user._count.listings,
      reviews: user._count.reviews,
      favorites: user._count.favorites,
    }
  }

  sendSuccess(res, formatted)
})

// PATCH /admin/users/:id/role
adminRouter.patch('/users/:id/role', requireRole('SUPER_ADMIN'), validate({ body: updateRoleSchema }), async (req, res) => {
  const userId = String(req.params.id)
  const user = await db.authUser.findUnique({ where: { id: BigInt(userId) } })
  if (!user) throw new NotFoundError('User')

  const updated = await db.authUser.update({
    where: { id: BigInt(userId) },
    data: { role: req.body.role },
    select: { id: true, email: true, role: true },
  })
  sendSuccess(res, { ...updated, id: updated.id.toString() }, 'User role updated')
})

// PATCH /admin/users/:id/toggle-active
adminRouter.patch('/users/:id/toggle-active', requireRole('SUPER_ADMIN'), async (req, res) => {
  const userId = String(req.params.id)
  const user = await db.authUser.findUnique({ where: { id: BigInt(userId) } })
  if (!user) throw new NotFoundError('User')
  const updated = await db.authUser.update({
    where: { id: BigInt(userId) },
    data: { is_active: !user.is_active },
    select: { id: true, email: true, is_active: true },
  })
  sendSuccess(res, { ...updated, id: updated.id.toString() }, `User ${updated.is_active ? 'activated' : 'deactivated'}`)
})

// DELETE /admin/users/:id
adminRouter.delete('/users/:id', requireRole('SUPER_ADMIN'), async (req, res) => {
  const userId = String(req.params.id)
  const user = await db.authUser.findUnique({ where: { id: BigInt(userId) } })
  if (!user) throw new NotFoundError('User')
  await db.authUser.update({
    where: { id: BigInt(userId) },
    data: { is_deleted: true, deleted_date: new Date(), is_active: false },
  })
  sendNoContent(res)
})

// POST /admin/employees
adminRouter.post('/employees', requireRole('SUPER_ADMIN'), validate({ body: addEmployeeSchema }), async (req, res) => {
  const existing = await db.authUser.findFirst({ where: { email: req.body.email } })
  if (existing) throw new ConflictError('An account with this email already exists')
  const passwordHash = await hashPassword(req.body.password)
  const employee = await db.authUser.create({
    data: {
      email: req.body.email,
      password_hash: passwordHash,
      role: 'EMPLOYEE',
      profile: {
        create: {
          display_name: req.body.full_name,
        }
      }
    },
    select: { id: true, email: true, created_date: true },
  })
  sendSuccess(res, { ...employee, id: employee.id.toString() }, 'Employee account created')
})

// POST /admin/hostel-admins
adminRouter.post('/hostel-admins', requireRole('SUPER_ADMIN'), validate({ body: createHostelAdminSchema }), async (req, res) => {
  const existing = await db.authUser.findFirst({ where: { email: req.body.email } })
  if (existing) throw new ConflictError('An account with this email already exists')

  const hostel = await db.hostel.findUnique({ where: { property_id: BigInt(req.body.property_id) } })
  if (!hostel) throw new NotFoundError('Hostel for this property')

  const passwordHash = await hashPassword(req.body.password)
  const admin = await db.authUser.create({
    data: {
      email: req.body.email,
      password_hash: passwordHash,
      role: 'HOSTEL_ADMIN',
      assigned_hostel_id: hostel.id,
      profile: {
        create: {
          display_name: req.body.full_name,
        }
      }
    },
    select: { id: true, email: true },
  })
  sendSuccess(res, { ...admin, id: admin.id.toString() }, 'Hostel admin created')
})

// GET /admin/properties
adminRouter.get('/properties', async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined
  const page = parseInt(String(req.query.page ?? '1'))
  const pageSize = 20

  const where: Prisma.ListListingWhereInput = {
    is_deleted: false,
    ...(status && { status: status }),
  }

  const [total, properties] = await Promise.all([
    db.listListing.count({ where }),
    db.listListing.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
        media_assets: { take: 1 },
        _count: { select: { favorites: true, inquiries: true } },
      },
      orderBy: { created_date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  // Format properties output
  const formattedProperties = properties.map(p => ({
    id: p.id.toString(),
    title: p.title,
    price: p.price,
    status: p.status,
    created_at: p.created_date,
    is_featured: p.is_featured,
    is_published: p.is_published,
    user: {
      id: p.user.id.toString(),
      email: p.user.email
    },
    images: p.media_assets.map(img => ({
      id: img.id.toString(),
      url: img.storage_path
    })),
    _count: p._count
  }))

  sendSuccess(res, { properties: formattedProperties, total })
})

// PATCH /admin/properties/:id/feature
adminRouter.patch('/properties/:id/feature', requireRole('SUPER_ADMIN'), async (req, res) => {
  const listingId = String(req.params.id)
  const prop = await db.listListing.findUnique({ where: { id: BigInt(listingId) } })
  if (!prop) throw new NotFoundError('Property')
  const updated = await db.listListing.update({
    where: { id: BigInt(listingId) },
    data: { is_featured: !prop.is_featured },
    select: { id: true, title: true, is_featured: true },
  })
  sendSuccess(res, { ...updated, id: updated.id.toString() }, `Property ${updated.is_featured ? 'featured' : 'unfeatured'}`)
})
