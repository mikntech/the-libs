import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Document as MDocument, Types } from 'mongoose';
export type Conversation<
  side1Name extends string = 'side1',
  side2Name extends string = 'side2',
> = MDocument & {
  [key in side1Name]: string;
} & {
  [key in side2Name]: string;
} & {
  _id: Types.ObjectId;
  name: string;
  hiddenFor?: string[];
  lastMessage?: Message;
  unReadNumber: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface Message extends MDocument {
  _id: Types.ObjectId;
  ownerId: string;
  conversationId: string;
  message: string;
  whenQueried?: number;
  whenMarked?: number;
  createdAt: Date;
  updatedAt: Date;
}
