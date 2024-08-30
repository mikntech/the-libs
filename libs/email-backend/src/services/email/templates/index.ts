import { TODO } from '@the-libs/base-shared';

export type GenEmailFunction = (...args: TODO[]) => {
  subject: string;
  body: string;
};
