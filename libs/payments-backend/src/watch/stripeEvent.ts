import { WatchDB } from '@base-backend';
import { stripeEvent } from '@payments-backend';

WatchDB.add({
  model: stripeEvent(),
  event: 'change',
  handler: (data) => console.log('handler this data!!,  ', data),
});
