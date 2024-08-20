import { watchStripeEvents } from './stripeEvent';

export const watchPayments = () => watchStripeEvents();
