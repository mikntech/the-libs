import { getModel } from '@base-backend';
import { Conversation } from '@chat-backend';

export const conversation = (side1Name: string, side2Name: string) =>
  getModel<Conversation<typeof side1Name, typeof side2Name>>('conversation', {
    [side1Name]: {
      type: String,
    },
    [side2Name]: {
      type: String,
    },
    hiddenFor: [{ type: String }],
  });