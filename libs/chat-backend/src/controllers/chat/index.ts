import { highOrderHandler } from '@the-libs/express-backend';
import { User } from '@the-libs/auth-shared';
import { message } from '../../db/mongo/schemas/chat';
import { Conversation, DBConversation, Message } from '@the-libs/chat-shared';
import { PubSub, createRedisInstance } from '@the-libs/redis-backend';
import { AuthenticatedRequest, user } from '@the-libs/auth-backend';
import { findDocs } from '@the-libs/mongo-backend';

const pubSubInstance = new PubSub(
  await createRedisInstance(),
  await createRedisInstance(),
);

export const getNameOfUser = async (userId: string) =>
  (await (await user(false, false)).findById(userId))?.full_name;

export const markMessagesAsRead = async (
  messages: Message[],
  user: User,
  level: 'queried' | 'marked',
) =>
  messages
    .filter(
      level === 'queried'
        ? ({ whenQueried, owner }) =>
            String(user._id) !== String(owner) && !whenQueried
        : ({ whenMarked, owner }) =>
            String(user._id) !== String(owner) && !whenMarked,
    )
    .forEach((message) => {
      if (level === 'queried') message.whenQueried = Date.now();
      else message.whenMarked = Date.now();
      message.save();
    });

export const getNumberOfUnreadMessagesInConversation = async <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>(
  { _id }: DBConversation<Mediator, Side1Name, Side2Name, PairName>,
  user: User,
) =>
  (
    await findDocs<true, Message>(
      (await message()).find({
        conversation: _id,
      }),
    )
  ).filter(
    ({ owner, whenQueried }) =>
      String(owner) !== String(user._id) && !whenQueried,
  ).length;

export const subscribeHandler = () =>
  highOrderHandler(
    async (req: AuthenticatedRequest, write) => {
      pubSubInstance.subscribe('chats', (data: string) =>
        write(`data: ${JSON.stringify({ message: data })}\n\n`),
      );

      req.on('close', () => {
        pubSubInstance.unsubscribe('chats');
      });
    },
    [
      { path: 'Content-Type', stat: 'text/event-stream' },
      { path: 'Cache-Control', stat: 'no-cache' },
      { path: 'Connection', stat: 'keep-alive' },
    ],
  );
