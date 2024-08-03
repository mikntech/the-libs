import { TODO } from 'base-shared';

export type GenEmailFunction = (...args: TODO[]) => {
  subject: string;
  body: string;
};
