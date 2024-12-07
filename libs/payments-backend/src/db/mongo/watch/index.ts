import { watchStripeEvents } from './stripeEvent';
import type { GenericListener, ChangeStreamInsertDocument } from 'mongodb';

export const watchPayments = <
  H extends GenericListener = (event: ChangeStreamInsertDocument) => void,
>(
  handler: H,
) => watchStripeEvents(handler);
