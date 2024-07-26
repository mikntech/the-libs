import { Message } from '../../types/chat';
import { highOrderHandler, TODO, UnauthorizedError } from 'base-backend';
import { AuthenticatedRequest, User, user } from 'auth-backend';
import { conversation, message } from '../../schemas/chat';

export const getLastMessageOfConversation = async (conversationId: string) =>
  await message().findOne({ conversationId }).sort({ createdAt: -1 }).exec();

export const getNameOfUser = async (userId: string) =>
  (await user(false, false, false).findById(userId))?.full_name;

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
    await message().find({
      conversationId,
    })
  ).filter(
    ({ ownerId, whenQueried }) => ownerId !== String(user._id) && !whenQueried,
  ).length;

export const subscribeHandler = (PubSub: TODO) =>
  highOrderHandler(
    async (req: AuthenticatedRequest, write) => {
      const token = PubSub.subscribe('chats', (_: TODO, data: TODO) =>
        write(`data: ${JSON.stringify({ message: data })}\n\n`),
      );

      req.on('close', () => {
        PubSub.unsubscribe(token);
      });
    },
    [
      { path: 'Content-Type', stat: 'text/event-stream' },
      { path: 'Cache-Control', stat: 'no-cache' },
      { path: 'Connection', stat: 'keep-alive' },
    ],
  );

export const sendMessage = async <ENUM>(
  userx: User,
  UserTypeEnum: TODO[],
  conversationIdOrAddressee: string,
  messagex: string,
) => {
  const Message = message();
  const Conversation = conversation();
  let conversationR = await Conversation.findById(conversationIdOrAddressee);
  let hostId: /*User | string */ TODO = await user(
    false,
    false,
    false,
  ).findById(conversationIdOrAddressee);
  if (!hostId) {
    const companyF = /* await company().findById(conversationIdOrAddressee);*/ {
      host: 'Asdasd',
    };
    hostId = companyF?.host?.toString();
  } else hostId = String((hostId as User)?._id);
  if (hostId) {
    conversationR = await Conversation.findOne({
      hostId,
      guestId: String(userx._id),
    });
  }
  if (!conversationR?._id) {
    conversationR = new Conversation({
      ...((userx as TODO).type === (UserTypeEnum as TODO).host
        ? { hostId: userx._id }
        : { guestId: userx._id }),
      ...((userx as TODO).type === (UserTypeEnum as TODO).guest
        ? { hostId }
        : { guestId: hostId }),
    });
    await conversationR.save();
  }
  console.log('String(user._id): ', String(userx._id));
  console.log('conversation: ', conversationR);
  if (
    String(userx._id) !== conversationR.hostId &&
    String(userx._id) !== conversationR.guestId
  )
    throw new UnauthorizedError('You are not part of the conversation');
  const newMessage = new Message({
    ownerId: String(userx._id),
    conversationId: conversationR._id,
    message: messagex,
  });

  await newMessage.save();

  return { statusCode: 201, body: 'Message Sent' };
};
