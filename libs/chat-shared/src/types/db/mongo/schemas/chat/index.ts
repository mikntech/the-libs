import type { Types } from 'mongoose';
import { DBDoc } from '@the-libs/mongo-backend';

export type DBConversation<
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
> = DBDoc & {
  [key in Side1Name]: string;
} & {
  [key in Side2Name]: string;
} & {
  [key in PairName]: string;
} & (Mediator extends true
    ? {
        mediator: string;
      }
    : object) & {
    title: string;
    hiddenFor?: string[];
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

export interface Message extends DBDoc {
  ownerIdOrRef: string;
  conversation: Types.ObjectId;
  message: string;
  attachments?: string[];
  whenQueried?: number;
  whenMarked?: number;
}
