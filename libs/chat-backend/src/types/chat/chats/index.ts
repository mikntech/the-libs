import { Document } from '@base-shared';

export type Conversation<
  side1Name extends string = 'side1',
  side2Name extends string = 'side2',
> = Document & {
  [key in side1Name]: string;
} & {
  [key in side2Name]: string;
} & {
  name: string;
  hiddenFor?: string[];
  lastMessage?: Message;
  unReadNumber: number;
};

export interface Message extends Document {
  ownerId: string;
  conversationId: string;
  message: string;
  whenQueried?: number;
  whenMarked?: number;
}
