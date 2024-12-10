import { watchStripeEvents } from './stripeEvent';
import type { GenericListener, ChangeStreamInsertDocument } from 'mongodb';
import { StripeEvent } from '@the-libs/payments-shared';

export const watchPayments = <
  H extends GenericListener = (
    event: ChangeStreamInsertDocument<StripeEvent>,
  ) => void,
>(
  handler: H,
) => watchStripeEvents(handler);
