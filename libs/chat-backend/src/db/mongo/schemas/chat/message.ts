import { getModel } from '@base-backend';
import { Message } from '@chat-backend';

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
