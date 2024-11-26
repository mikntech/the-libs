import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { TODO, UnauthorizedError } from '@the-libs/base-shared';
import {
  conversation,
  getNameOfUser,
  getNumberOfUnreadMessagesInConversation,
} from '../../../../';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { User } from '@the-libs/auth-shared';
import { Conversation } from '@the-libs/chat-shared';
import { findDocs } from '@the-libs/mongo-backend';
import { Model } from 'mongoose';

export const generateConversationRouter = <
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
  const conversationRouter = Router();

  conversationRouter.get(
    '/:quantity?',
    highOrderHandler(async (req: AuthenticatedRequest<UserType>) => {
      type GenericConversation = Conversation<
        Mediator,
        Side1Name,
        Side2Name,
        PairName
      >;
      if (!(req.user as User)) throw new UnauthorizedError('not logged in');
      let quantity: number | undefined = parseInt(req.params['quantity']);
      const model = await conversation(optional);

      if (isNaN(quantity) || quantity < 1) {
        quantity = undefined;
      }

      const query = model.find({
        $or: [
          { hostId: String(req.user?._id) },
          { guestId: String(req.user?._id) },
        ],
      });

      quantity && query.limit(quantity);

      const conversations: GenericConversation[] = (await query) as TODO;

      const body = await Promise.all(
        (await query).map(async (conversation) => ({
          ...conversation,
          lastMessage: (await model.getCached(conversation._id)).lastMessage,
          title: conversation.title ?? findUserName //todo todo todo
          unReadNumber: await getNumberOfUnreadMessagesInConversation(
            c._id.toString(),
            req.user as User,
          ),
        })),
      );

      return {
        statusCode: 200,
        body,
      };
    }) as TODO,
  );

  return conversationRouter;
};
