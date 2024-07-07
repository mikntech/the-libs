import { Message } from '../../types/chat';
import { highOrderHandler, TODO } from 'gbase-b';
import { AuthenticatedRequest, User, user } from 'auth-b';
import { message } from '../../schemas/chat';

export const getLastMessageOfConversation = async (conversationId: string) =>
  await message().findOne({ conversationId }).sort({ createdAt: -1 }).exec();

export const getNameOfUser = async (userId: string) =>
  (await user(false, false).findById(userId))?.full_name;

export const markMessagesAsRead = async (
  messages: Message[],
  user: User,
  level: 'queried' | 'marked'
) =>
  messages
    .filter(
      level === 'queried'
        ? ({ whenQueried, ownerId }) =>
            user._id.toString() !== ownerId && !whenQueried
        : ({ whenMarked, ownerId }) =>
            user._id.toString() !== ownerId && !whenMarked
    )
    .forEach((message) => {
      if (level === 'queried') message.whenQueried = Date.now();
      else message.whenMarked = Date.now();
      message.save();
    });

export const getNumberOfUnreadMessagesInConversation = async (
  conversationId: string,
  user: User
) =>
  (
    await message().find({
      conversationId,
    })
  ).filter(
    ({ ownerId, whenQueried }) =>
      ownerId !== user._id.toString() && !whenQueried
  ).length;

export const subscribeHandler = (PubSub: TODO) =>
  highOrderHandler(
    async (req: AuthenticatedRequest, write) => {
      const token = PubSub.subscribe('chats', (_: TODO, data: TODO) =>
        write(`data: ${JSON.stringify({ message: data })}\n\n`)
      );

      req.on('close', () => {
        PubSub.unsubscribe(token);
      });
    },
    [
      { path: 'Content-Type', stat: 'text/event-stream' },
      { path: 'Cache-Control', stat: 'no-cache' },
      { path: 'Connection', stat: 'keep-alive' },
    ]
  );
