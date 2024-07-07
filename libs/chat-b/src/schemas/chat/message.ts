import { getModel } from 'gbase-b';
import { Message } from '../../types/chat';

export const message= () =>
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
