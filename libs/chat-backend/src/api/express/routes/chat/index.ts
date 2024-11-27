import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { generateMessageRouter } from './messagesRouter';
import { subscribeHandler } from '../../../../controllers/chat';
import { generateConversationRouter } from './conversationsRouter';

export const generateChatRouter = <
  UserType,
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>(
  optional: { mediator?: boolean } & (
    | {
        side1Name: string;
        side2Name: string;
      }
    | { pairName: string }
  ),
) => {
  const chatRouter = Router();

  chatRouter.use(
    '/conversations',
    generateConversationRouter<
      UserType,
      Mediator,
      Side1Name,
      Side2Name,
      PairName
    >(optional),
  );
  chatRouter.use('/messages', generateMessageRouter(optional));

  chatRouter.get('/subscribe', subscribeHandler());

  return chatRouter;
};
