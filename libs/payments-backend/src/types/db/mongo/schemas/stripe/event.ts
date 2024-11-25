import type { Stripe } from 'stripe';
import { BaseEvent } from '../abstract/event';

export type RawStripeEvent = Stripe.Event;

export interface StripeEvent extends BaseEvent {
  stringifiedStripeEvent: string & { __type__: RawStripeEvent };
}
