import { Document, ObjectId } from "mongoose";

export interface Conversation extends Document {
  _id: ObjectId;
  hostId: string;
  guestId: string;
  name: string;
  hiddenFor?: string[];
  lastMessage?: Message;
  unReadNumber: number;
}

export interface Message extends Document {
  _id: ObjectId;
  ownerId: string;
  conversationId: string;
  message: string;
  whenQueried?: number;
  whenMarked?: number;
  createdAt: string;
  updatedAt: string;
}
