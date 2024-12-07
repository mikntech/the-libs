import { watchStripeEvents } from './stripeEvent';
import type { GenericListener, ChangeStreamInsertDocument } from 'mongodb';
import { StripeEvent } from '../../../types';

export const watchPayments = <
  H extends GenericListener = (
    event: ChangeStreamInsertDocument<StripeEvent>,
  ) => void,
>(
  handler: H,
) => watchStripeEvents(handler);
