import type { Document as MDocument, Types } from 'mongoose';

export type DBConversation<
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
> = MDocument & {
  [key in Side1Name]: string;
} & {
  [key in Side2Name]: string;
} & {
  [key in PairName]: string;
} & (Mediator extends true
    ? {
        mediator: string;
      }
    : {}) & {
    _id: Types.ObjectId;
    title: string;
    hiddenFor?: string[];
    createdAt: Date;
    updatedAt: Date;
  };

export interface CachedConversation {
  lastMessage: Message | null;
}

export type Conversation<
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
> = DBConversation<Mediator, Side1Name, Side2Name, PairName> &
  CachedConversation;

export interface Message extends MDocument {
  _id: Types.ObjectId;
  ownerIdOrRef: string;
  conversation: Types.ObjectId;
  message: string;
  attachments?: string[];
  whenQueried?: number;
  whenMarked?: number;
  createdAt: Date;
  updatedAt: Date;
}
