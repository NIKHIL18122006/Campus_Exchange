import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate, sendMessageSchema } from '../middleware/validation.middleware.js';
import { messageLimiter } from '../middleware/rateLimiter.js';
import {
  listConversations,
  getUnreadCount,
  getMessages,
  sendMessage,
} from '../controllers/conversation.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listConversations);
router.get('/unread-count', getUnreadCount);        // must be above /:id routes
router.get('/:id/messages', getMessages);
router.post('/:id/messages', messageLimiter, validate(sendMessageSchema), sendMessage);

export default router;