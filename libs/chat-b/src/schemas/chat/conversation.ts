import { getModel } from '../../../../gbase-b/src/schemas';
import { Conversation } from '../../types/chat/chats';

export default () =>
  getModel<Conversation>('conversation', {
    firstId: {
      type: String,
    },
    secondId: {
      type: String,
    },
    hiddenFor: [{ type: String }],
  });
