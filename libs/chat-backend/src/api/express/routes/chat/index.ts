import { Router } from 'express';
import { generateConversationRouter } from './conversationsRouter';
import { generateMessageRouter } from './messagesRouter';
import { subscribeHandler } from '../../../../controllers/chat';
import { TODO } from '@base-shared';

export const generateChatRouter = (side1Name: string, side2Name: string) => {
  const chatRouter = Router();

  chatRouter.use(
    '/conversations',
    generateConversationRouter(side1Name, side2Name),
  );
  chatRouter.use('/messages', generateMessageRouter(side1Name, side2Name));

  chatRouter.get('/subscribe', subscribeHandler() as TODO);

  return chatRouter;
};
