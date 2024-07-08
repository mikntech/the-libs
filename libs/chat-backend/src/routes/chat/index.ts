import { Router } from 'express';
import conversationsRouter from './conversationsRouter';
import messagesRouter from './messagesRouter';
import { subscribeHandler } from '../../controllers/chat';
import { TODO } from 'base-backend';

const router = Router();

router.use('/conversations', conversationsRouter);
router.use('/messages', messagesRouter);

router.get('/subscribe', subscribeHandler(null) as TODO);

export default router;
