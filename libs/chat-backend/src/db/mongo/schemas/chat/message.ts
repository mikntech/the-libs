import { getModel } from '@the-libs/mongo-backend';
import { Message } from '@the-libs/chat-shared';
import { Schema } from 'mongoose';

export const message = () =>
  getModel<Message>('message', {
    ownerIdOrRef: {
      type: String,
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [{ type: String }],
    whenQueried: Number,
    whenMarked: Number,
  });
