import type { Stripe } from 'stripe';
import { BaseEvent } from '../abstract';

export type RawStripeEvent = Stripe.Event;

export interface StripeEvent extends BaseEvent {
  stringifiedStripeEvent: string;
}
