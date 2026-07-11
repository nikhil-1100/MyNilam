import { Router } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { requireAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { sendSuccess, sendCreated } from '../utils/response'
import { NotFoundError } from '../utils/errors'

export const messagesRouter = Router()
messagesRouter.use(requireAuth)

const sendSchema = z.object({
  recipient_id: z.string(),
  content: z.string().min(1).max(2000),
  property_id: z.string().optional(),
})

// GET /messages — get conversation list
messagesRouter.get('/', async (req, res) => {
  const userId = req.user!.id

  const participantConversations = await db.chatConversationParticipant.findMany({
    where: { user_id: userId },
    select: { conversation_id: true }
  })
  const convoIds = participantConversations.map(c => c.conversation_id)

  const messages = await db.message.findMany({
    where: {
      conversation_id: { in: convoIds },
      is_deleted: false,
    },
    include: {
      sender: { select: { id: true, email: true } },
      conversation: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, email: true } }
            }
          }
        }
      }
    },
    orderBy: { sent_date: 'desc' },
    take: 100,
  })

  // Format to flat output expected by frontend
  const formatted = messages.map(m => {
    const otherParticipant = m.conversation.participants.find(p => p.user_id !== userId)
    return {
      id: m.id.toString(),
      content: m.content,
      sender_id: m.sender_user_id.toString(),
      recipient_id: otherParticipant ? otherParticipant.user_id.toString() : null,
      created_at: m.sent_date,
      is_read: m.read_date !== null,
      sender: {
        id: m.sender.id.toString(),
        email: m.sender.email
      },
      recipient: otherParticipant ? {
        id: otherParticipant.user.id.toString(),
        email: otherParticipant.user.email
      } : null
    }
  })

  sendSuccess(res, formatted)
})

// GET /messages/conversation/:userId — get conversation with a specific user
messagesRouter.get('/conversation/:userId', async (req, res) => {
  const myId = req.user!.id
  const otherId = BigInt(req.params.userId)

  const conversation = await db.chatConversation.findFirst({
    where: {
      AND: [
        { participants: { some: { user_id: myId } } },
        { participants: { some: { user_id: otherId } } }
      ]
    }
  })

  if (!conversation) {
    return sendSuccess(res, [])
  }

  const messages = await db.message.findMany({
    where: {
      conversation_id: conversation.id,
      is_deleted: false,
    },
    include: {
      sender: { select: { id: true, email: true } },
    },
    orderBy: { sent_date: 'asc' },
  })

  // Mark received messages as read
  await db.message.updateMany({
    where: {
      conversation_id: conversation.id,
      sender_user_id: otherId,
      read_date: null,
    },
    data: {
      read_date: new Date(),
    },
  })

  const formatted = messages.map(m => ({
    id: m.id.toString(),
    content: m.content,
    sender_id: m.sender_user_id.toString(),
    recipient_id: m.sender_user_id === myId ? otherId.toString() : myId.toString(),
    created_at: m.sent_date,
    is_read: m.read_date !== null,
    sender: {
      id: m.sender.id.toString(),
      email: m.sender.email
    }
  }))

  sendSuccess(res, formatted)
})

// POST /messages — send a message
messagesRouter.post('/', validate({ body: sendSchema }), async (req, res) => {
  const { recipient_id, content } = req.body
  const myId = req.user!.id
  const otherId = BigInt(recipient_id)

  const recipient = await db.authUser.findUnique({ where: { id: otherId } })
  if (!recipient || !recipient.is_active) throw new NotFoundError('Recipient user')

  // Find or create conversation
  let conversation = await db.chatConversation.findFirst({
    where: {
      AND: [
        { participants: { some: { user_id: myId } } },
        { participants: { some: { user_id: otherId } } }
      ]
    }
  })

  if (!conversation) {
    conversation = await db.chatConversation.create({
      data: {
        subject_entity_type: 'DirectMessage',
        subject_entity_id: 0n,
        initiated_by: myId,
        participants: {
          create: [
            { user_id: myId },
            { user_id: otherId }
          ]
        }
      }
    })
  }

  const message = await db.message.create({
    data: {
      conversation_id: conversation.id,
      sender_user_id: myId,
      content,
    },
    include: {
      sender: { select: { id: true, email: true } },
    },
  })

  sendCreated(res, {
    id: message.id.toString(),
    content: message.content,
    sender_id: myId.toString(),
    recipient_id: otherId.toString(),
    created_at: message.sent_date,
    is_read: false,
    sender: {
      id: message.sender.id.toString(),
      email: message.sender.email
    },
    recipient: {
      id: recipient.id.toString(),
      email: recipient.email
    }
  })
})

// PATCH /messages/:id/read — mark message as read
messagesRouter.patch('/:id/read', async (req, res) => {
  const messageId = BigInt(req.params.id)
  await db.message.update({
    where: { id: messageId },
    data: { read_date: new Date() },
  })
  sendSuccess(res, null, 'Message marked as read')
})

// GET /messages/unread-count
messagesRouter.get('/unread-count', async (req, res) => {
  const myId = req.user!.id
  const participantConvos = await db.chatConversationParticipant.findMany({
    where: { user_id: myId },
    select: { conversation_id: true }
  })
  const convoIds = participantConvos.map(c => c.conversation_id)

  const count = await db.message.count({
    where: {
      conversation_id: { in: convoIds },
      sender_user_id: { not: myId },
      read_date: null,
      is_deleted: false,
    },
  })
  sendSuccess(res, { count })
})
