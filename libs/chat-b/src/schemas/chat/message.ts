import { getModel } from '../../../../gbase-b/src/schemas';
import { Message } from '../../types/chat/chats';

export default () =>
  getModel<Message>('message', {
    ownerId: {
      type: String,
    },
    conversationId: { type: String },
    message: {
      type: String,
    },
    whenQueried: Number,
    whenMarked: Number,
  });
