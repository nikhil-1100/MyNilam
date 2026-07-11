/**
 * Notifications Routes (Aligned with 21-Module Schema)
 */
import { Router } from 'express'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { sendSuccess, sendNoContent } from '../utils/response'

export const notificationsRouter = Router()
notificationsRouter.use(requireAuth)

// GET /notifications
notificationsRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string ?? '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize
  const userId = req.user!.id

  const [total, notifications] = await Promise.all([
    db.notification.count({ where: { user_id: userId } }),
    db.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const unread = await db.notification.count({
    where: { user_id: userId, read: false },
  })

  // Map database read status to is_read for frontend expectation
  const formattedNotifications = notifications.map(n => ({
    ...n,
    is_read: n.read,
  }))

  sendSuccess(res, { notifications: formattedNotifications, total, unread })
})

// PATCH /notifications/:id/read
notificationsRouter.patch('/:id/read', async (req, res) => {
  const notificationId = req.params.id
  await db.notification.updateMany({
    where: { id: BigInt(notificationId), user_id: req.user!.id },
    data: { read: true },
  })
  sendSuccess(res, null, 'Notification marked as read')
})

// POST /notifications/read-all
notificationsRouter.post('/read-all', async (req, res) => {
  await db.notification.updateMany({
    where: { user_id: req.user!.id, read: false },
    data: { read: true },
  })
  sendSuccess(res, null, 'All notifications marked as read')
})

// DELETE /notifications/:id
notificationsRouter.delete('/:id', async (req, res) => {
  const notificationId = req.params.id
  await db.notification.deleteMany({
    where: { id: BigInt(notificationId), user_id: req.user!.id },
  })
  sendNoContent(res)
})

// GET /notifications/unread-count
notificationsRouter.get('/unread-count', async (req, res) => {
  const count = await db.notification.count({
    where: { user_id: req.user!.id, read: false },
  })
  sendSuccess(res, { count })
})
