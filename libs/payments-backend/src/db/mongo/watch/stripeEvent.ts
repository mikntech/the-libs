import { WatchDB } from '@base-backend';
import { stripeEvent } from '@payments-backend';

export const watchStripeEvents = () =>
  WatchDB.add({
    modelGetter: stripeEvent,
    event: 'change',
    handler: (data) => console.log('handler this data!!,  ', data),
  });
