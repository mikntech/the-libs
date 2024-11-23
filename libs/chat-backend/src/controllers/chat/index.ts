import { highOrderHandler } from '@the-libs/express-backend';
import { User } from '@the-libs/auth-shared';
import { message } from '../../db/mongo/schemas/chat';
import { Message } from '@the-libs/chat-shared';
import {
  createPubSubInstance,
  createRedisInstance,
} from '@the-libs/redis-backend';
import { AuthenticatedRequest, user } from '@the-libs/auth-backend';

const pubSubInstance = createPubSubInstance(
  await createRedisInstance(),
  await createRedisInstance(),
);

export const getLastMessageOfConversation = async (conversationId: string) =>
  await (await message())
    .findOne({ conversationId })
    .sort({ createdAt: -1 })
    .exec();

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
        ? ({ whenQueried, ownerId }) =>
            String(user._id) !== ownerId && !whenQueried
        : ({ whenMarked, ownerId }) =>
            String(user._id) !== ownerId && !whenMarked,
    )
    .forEach((message) => {
      if (level === 'queried') message.whenQueried = Date.now();
      else message.whenMarked = Date.now();
      message.save();
    });

export const getNumberOfUnreadMessagesInConversation = async (
  conversationId: string,
  user: User,
) =>
  (
    await (
      await message()
    ).find({
      conversationId,
    })
  ).filter(
    ({ ownerId, whenQueried }) => ownerId !== String(user._id) && !whenQueried,
  ).length;

export const subscribeHandler = () =>
  highOrderHandler(
    async (req: AuthenticatedRequest, write) => {
      const token = pubSubInstance.subscribe('chats', (data: string) =>
        write(`data: ${JSON.stringify({ message: data })}\n\n`),
      ) as string;

      req.on('close', () => {
        pubSubInstance.unsubscribe(token);
      });
    },
    [
      { path: 'Content-Type', stat: 'text/event-stream' },
      { path: 'Cache-Control', stat: 'no-cache' },
      { path: 'Connection', stat: 'keep-alive' },
    ],
  );
