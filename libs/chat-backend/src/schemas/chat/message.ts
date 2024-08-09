import { getModel } from '@base-shared';
import { Message } from '../../types/chat';

export const message = () =>
  getModel<Message>('message', {
    ownerId: {
      type: String,
    },
    conversationId: { type: String },
    message: {
      type: String,
    },
    attachments: [{ type: String }],
    whenQueried: Number,
    whenMarked: Number,
  });
