import { Stripe } from 'stripe';
import { BaseEvent } from '../';

export type RawStripeEvent = Stripe.Event;

export interface StripeEvent extends BaseEvent {
  stringifiedStripeEvent: string & { __type__: RawStripeEvent };
}
