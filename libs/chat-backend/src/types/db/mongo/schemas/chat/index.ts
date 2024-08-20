import { Document as MDocument, Types } from 'mongoose';

export type Conversation<
  side1Name extends string = 'side1',
  side2Name extends string = 'side2',
> = MDocument<Types.ObjectId> & {
  [key in side1Name]: string;
} & {
  [key in side2Name]: string;
} & {
  name: string;
  hiddenFor?: string[];
  lastMessage?: Message;
  unReadNumber: number;
};

export interface Message extends MDocument {
  _id: Types.ObjectId;
  ownerId: string;
  conversationId: string;
  message: string;
  whenQueried?: number;
  whenMarked?: number;
  createdAt: Date;
}
