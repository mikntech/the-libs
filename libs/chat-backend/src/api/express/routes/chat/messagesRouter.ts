import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { User } from '@the-libs/auth-shared';
import { conversation, message, markMessagesAsRead } from '../../../../';
import { Conversation, Message } from '@the-libs/chat-shared';
import { findDocs } from '@the-libs/mongo-backend';
import { TODO } from '@the-libs/base-shared';

export const generateMessageRouter = <
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
  const messageRouter = Router();

  messageRouter.get(
    '/conversationMessages/:id',
    highOrderHandler(async (req: AuthenticatedRequest<UserType>) => {
      const MessageModel = await message();
      const ConversationModel = await conversation(optional);
      const conversationDoc = await findDocs<
        false,
        Conversation<Mediator, Side1Name, Side2Name, PairName>
      >(
        ConversationModel as TODO,
        ConversationModel.findById(req.params['id']),
      );
      /* if (
        String(req.user?._id) !== conversationDoc?.[side1Name] &&
        String(req.user?._id) !== conversationDoc?.[side2Name]
      )
        throw new UnauthorizedError('You are not part of the conversation');*/
      const messages = await findDocs<true, Message>(
        MessageModel,
        MessageModel.find({
          conversationId: String(conversationDoc?._id),
        }),
      );
      await markMessagesAsRead(messages, req.user as User, 'queried');
      return { statusCode: 200, body: messages };
    }),
  );

  return messageRouter;
};
