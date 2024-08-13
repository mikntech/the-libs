import { getModel } from '@base-shared';
import { StripeEvent } from '../../types';

export const stripeEvent = () =>
  getModel<StripeEvent>('stripeEvent', {
    stripeEvent: { type: String, required: true },
  });
