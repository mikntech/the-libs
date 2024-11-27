import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { TODO, UnauthorizedError } from '@the-libs/base-shared';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { User } from '@the-libs/auth-shared';
import { conversation, message, markMessagesAsRead } from '../../../../';
import { Conversation } from '@the-libs/chat-shared';
import { findDocs } from '@the-libs/mongo-backend';

export const generateMessageRouter = <UserType>(
  side1Name: string,
  side2Name: string,
) => {
  const messageRouter = Router();
  /*

  messageRouter.get(
    '/conversationMessages/:id',
    highOrderHandler((async (req: AuthenticatedRequest<UserType>) => {
      const MessageModel = await message();
      const ConversationModel = await conversation(side1Name, side2Name);
      const conversationDoc = await findDocs<
        false,
        Conversation<typeof side1Name, typeof side2Name>
      >(ConversationModel.findById(req.params['id']));
      if (
        String(req.user?._id) !== conversationDoc?.[side1Name] &&
        String(req.user?._id) !== conversationDoc?.[side2Name]
      )
        throw new UnauthorizedError('You are not part of the conversation');
      const messages = await MessageModel.find({
        conversationId: String(conversationDoc?._id),
      });
      await markMessagesAsRead(messages, req.user as User, 'queried');
      return { statusCode: 200, body: messages };
    }) as TODO),
  );
*/

  return messageRouter;
};
