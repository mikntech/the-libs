import { stringifyIfNeeded } from '@the-libs/base-shared';
import { createStripeInstance } from '../../services';

import type { Stripe as StripeType } from 'stripe';

export const createPayment = async (
  currency = 'usd',
  paymentId: string,
  unitAmount = 1,
  quantity = 1,
  fee = 2020202020202020,
  connectedAccountId: string,
  successUrl: string,
) => {
  await createStripeInstance().checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: paymentId,
          },
          unit_amount: unitAmount,
        },
        quantity,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee,
      transfer_data: {
        destination: connectedAccountId,
      },
    },
    mode: 'payment',
    success_url: successUrl + '{CHECKOUT_SESSION_ID}',
  });
};

export const createConnectedAccount =
  async (): Promise<StripeType.Account | null> => {
    try {
      return await createStripeInstance().accounts.create({
        controller: {
          stripe_dashboard: {
            type: 'none',
          },
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          requirement_collection: 'application',
        },
        capabilities: {
          transfers: { requested: true },
        },
        country: 'US',
      });
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account',
        error,
      );
      return null;
    }
  };

export const createConnectedAccountLink = async (
  accountId: string,
  returnUrl: string,
  refreshUrl: string,
): Promise<StripeType.AccountLink | null> => {
  try {
    return stringifyIfNeeded(
      await createStripeInstance().accountLinks.create({
        account: accountId,
        return_url: returnUrl,
        refresh_url: refreshUrl,
        type: 'account_onboarding',
      }),
    );
  } catch (error) {
    console.error(
      'An error occurred when calling the Stripe API to create an account link:',
      error,
    );
    return null;
  }
};

export const createConnectedAccountAndGetId = async (): Promise<
  string | null
> => (await createConnectedAccount())?.id || null;

export const createConnectedAccountAndAccountLink = async (
  returnUrl: string,
  refreshUrl: string,
): Promise<StripeType.AccountLink | null> => {
  const accountId = await createConnectedAccountAndGetId();
  if (accountId)
    return createConnectedAccountLink(accountId, returnUrl, refreshUrl);
  else console.log('error');
  return null;
};
