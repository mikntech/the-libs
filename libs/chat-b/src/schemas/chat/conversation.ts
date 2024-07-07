import { getModel } from 'gbase-b';
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
