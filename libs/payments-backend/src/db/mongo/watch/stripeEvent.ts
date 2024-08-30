import { WatchDB } from '@the-libs/base-backend';
import { stripeEvent } from '@the-libs/payments-backend';

export const watchStripeEvents = () =>
  WatchDB.add({
    modelGetter: stripeEvent,
    event: 'change',
    handler: (data) => console.log('handler this data!!,  ', data),
  });
