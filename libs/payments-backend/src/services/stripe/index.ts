import { paymentsSettings } from '../../config';
import { stripeEvent } from '../../db/mongo';
import { RawStripeEvent } from '@the-libs/payments-shared';
import { expressApp, getExpressSettings } from '@the-libs/express-backend';
import type { Request, Response } from 'express';

import { createRequire } from 'module';
import { createDoc } from '@the-libs/mongo-backend';
import { TODO } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);
const { json } = require('express');
const { Stripe } = require('stripe');
import type StripeInstance from 'stripe';

export const createStripeInstance = (): StripeInstance =>
  new Stripe(paymentsSettings.stripeApiKey, {
    apiVersion: paymentsSettings.stripeApiVersion,
  });

const saveStripeEventToDB = async (event: RawStripeEvent) => {
  try {
    await createDoc(await stripeEvent(), {
      stringifiedStripeEvent: JSON.stringify(event),
      idOnSource: event.id,
      tsOnSource: event.created,
      wasHandled: false,
    });
  } catch (e) {
    if (
      !String(e).startsWith(
        'MongoServerError: E11000 duplicate key error collection',
      )
    )
      console.log(e);
  }
};

export const webhookHandler = async (rawEvent: RawStripeEvent) => {
  try {
    await saveStripeEventToDB(rawEvent);
    await triggerSync();
  } catch (e) {
    console.log('stipe webhook error');
  }
};

const stripeWebhookPath = '/stripe-webhook';
console.log(
  `the stripe webhook path is ${getExpressSettings().myDomain}${stripeWebhookPath}`,
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
  const lastEvent = await ((await stripeEvent()).findOne() as TODO)
    .sort({ createdAt: -1 })
    .exec();
  return lastEvent?.tsOnSource || 0;
};

const triggerSync = async () =>
  (
    await createStripeInstance().events.list({
      created: { gt: await getLastRecordedEventTS() },
    })
  ).data.forEach((newEvent: RawStripeEvent) => saveStripeEventToDB(newEvent));

export const startStripeSync = (customMs?: number) =>
  setTimeout(
    () =>
      setInterval(triggerSync, paymentsSettings.syncIntervalInSeconds * 1000),
    customMs ?? 30000,
  );
