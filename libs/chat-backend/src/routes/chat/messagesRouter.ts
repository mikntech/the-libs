import { Router } from 'express';
import { findDocs, highOrderHandler } from '@base-backend';
import { TODO, UnauthorizedError } from '@base-shared';
import { AuthenticatedRequest, user, User } from '@auth-backend';
import {
  conversation,
  message,
  markMessagesAsRead,
  Conversation,
} from '@chat-backend';

export const generateMessageRouter = (side1Name: string, side2Name: string) => {
  const messageRouter = Router();

  messageRouter.get(
    '/conversationMessages/:id',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const MessageModel = message();
      const ConversationModel = conversation(side1Name, side2Name);
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

  return messageRouter;
};
