import { watchStripeEvents } from './stripeEvent';
import type { GenericListener } from 'mongodb';

export const watchPayments = (handler: GenericListener) =>
  watchStripeEvents(handler);
