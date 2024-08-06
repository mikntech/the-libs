import { getModel } from 'base-shared';
import { Conversation } from '../../types/chat';

export const conversation = () =>
  getModel<Conversation>('conversation', {
    guestId: {
      type: String,
    },
    hostId: {
      type: String,
    },
    hiddenFor: [{ type: String }],
  });
