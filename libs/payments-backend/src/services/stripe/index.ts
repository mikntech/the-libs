import { Stripe } from 'stripe';
import { paymentsSettings, stripeEvent } from '@payments-backend';

export const stripeInstance = new Stripe(paymentsSettings.stripeApiKey, {
  apiVersion: '2024-06-20',
});

export const webhookHandler = async (event: string | Stripe.Event) => {
  try {
    const doc = new (stripeEvent())({
      stripeEvent: typeof event === 'string' ? event : JSON.stringify(event),
    });
    console.log('logging stripe event...');
    await doc.save();
    console.log('stripe event logged');
  } catch (e) {
    console.log('stipe event logging error!!');
  }
};
