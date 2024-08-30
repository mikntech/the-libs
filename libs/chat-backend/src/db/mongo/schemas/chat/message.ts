import { getModel } from '@the-libs/base-backend';
import { Message } from '@the-libs/chat-backend';

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
