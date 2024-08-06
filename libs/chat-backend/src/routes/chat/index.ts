import { Router } from 'express';
import conversationsRouter from './conversationsRouter';
import messagesRouter from './messagesRouter';
import { subscribeHandler } from '../../controllers/chat';
import PubSub from 'pubsub-js';
import { TODO } from 'base-shared';

export const chatRouter = Router();

chatRouter.use('/conversations', conversationsRouter);
chatRouter.use('/messages', messagesRouter);

chatRouter.get('/subscribe', subscribeHandler(PubSub) as TODO);
