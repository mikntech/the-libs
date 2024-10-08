import { WatchDB } from '@the-libs/mongo-backend';
import { stripeEvent } from '@the-libs/payments-backend';
import type { GenericListener } from 'mongodb';

export const watchStripeEvents = (handler: GenericListener) =>
  WatchDB.add({
    modelGetter: stripeEvent,
    event: 'change',
    handler: (...args) => handler(...args),
  });
