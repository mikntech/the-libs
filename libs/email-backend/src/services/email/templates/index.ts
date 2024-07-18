import { TODO } from 'base-backend';

export type GenEmailFunction = (...args: TODO[]) => {
  subject: string;
  body: string;
};
