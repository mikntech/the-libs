import { Stripe } from 'stripe';
import { paymentsSettings } from '../../config';
import { stripeEvent } from '../../db/mongo/schemas';
import { RawStripeEvent } from '../../types';
import { expressApp, getBaseSettings } from '@the-libs/base-backend';
import type { Request, Response } from 'express';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { json } = require('express');

export const stripeInstance = new Stripe(paymentsSettings.stripeApiKey, {
  apiVersion: paymentsSettings.stripeApiVersion as any,
});

const saveStripeEventToDB = async (event: RawStripeEvent) => {
  try {
    console.log('got stripe event from webhook, trying to save to db...');
    const doc = new (stripeEvent())({
      stringifiedStripeEvent: JSON.stringify(event),
      idOnSource: event.id,
      tsOnSource: event.created,
      wasHandled: false,
      wasProcessed: false,
    });
    await doc.save();
    console.log('stripe event from webhook saved to db');
  } catch (e) {
    console.log(e);
  }
};

export const webhookHandler = async (rawEvent: RawStripeEvent) => {
  try {
    saveStripeEventToDB(rawEvent).then();
    triggerSync().then();
  } catch (e) {
    console.log('stipe webhook error');
  }
};

const stripeWebhookPath = '/stripe-webhook';
console.log(
  `the stripe webhook path is ${getBaseSettings().myDomain}${stripeWebhookPath}`,
);
expressApp.post(
  stripeWebhookPath,
  json({ type: 'application/json' }),
  (request: Request, response: Response) => {
    const event = request.body;
    webhookHandler(event).then(() =>
      console.log('stripe webhook event received'),
    );
    response.json({ received: true });
  },
);

const getLastRecordedEventTS = async (): Promise<number> => {
  const lastEvent = await stripeEvent()
    .findOne()
    .sort({ createdAt: -1 })
    .exec();
  return lastEvent?.tsOnSource || 0;
};

const triggerSync = async () =>
  (
    await stripeInstance.events.list({
      created: { gt: await getLastRecordedEventTS() },
    })
  ).data.forEach((newEvent) => saveStripeEventToDB(newEvent));

setTimeout(
  () => setInterval(triggerSync, paymentsSettings.syncIntervalInSeconds * 1000),
  30000,
);
