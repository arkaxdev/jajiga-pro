import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Get all conversations
router.get(
  '/conversations',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getConversations
);

// Get single conversation with messages
router.get(
  '/conversations/:userId',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  getConversation
);

// Send message
router.post(
  '/send',
  authenticate,
  [
    body('receiverId').notEmpty().withMessage('شناسه گیرنده الزامی است'),
    body('content').notEmpty().withMessage('متن پیام الزامی است'),
    body('bookingId').optional().isString(),
  ],
  validate,
  sendMessage
);

// Mark messages as read
router.put(
  '/read',
  authenticate,
  [
    body('messageIds').isArray().withMessage('لیست پیام‌ها الزامی است'),
    body('messageIds.*').isString().withMessage('شناسه پیام معتبر نیست'),
  ],
  validate,
  markAsRead
);

// Delete message
router.delete('/:id', authenticate, deleteMessage);

// Get unread message count
router.get('/unread-count', authenticate, getUnreadCount);

export default router;
