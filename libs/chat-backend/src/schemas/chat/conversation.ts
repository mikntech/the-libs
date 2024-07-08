import { getModel } from 'base-backend';
import { Conversation } from '../../types/chat';

export const conversation= () =>
  getModel<Conversation>('conversation', {
    firstId: {
      type: String,
    },
    secondId: {
      type: String,
    },
    hiddenFor: [{ type: String }],
  });
