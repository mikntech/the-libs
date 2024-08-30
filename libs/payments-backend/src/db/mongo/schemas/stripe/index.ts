import { getModel } from '@the-libs/base-backend';
import { StripeEvent } from '../../../../types';
import { baseEvent } from '../abstract';

export const stripeEvent = () =>
  getModel<StripeEvent>(
    'stripeEvent',
    {
      ...baseEvent,
      stringifiedStripeEvent: { type: String, required: true },
    },
    { extraIndexs: [{ fields: { createdAt: 1 } }] },
  );
