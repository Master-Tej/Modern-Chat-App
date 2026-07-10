import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createConversationSchema } from './chat.validation';

const router = Router();

router.use(authenticate);

router.get('/', chatController.getConversations);
router.post('/', validate(createConversationSchema), chatController.createConversation);
router.get('/:id/messages', chatController.getMessages);
router.get('/:id/unread', chatController.getUnreadCount);

export default router;
