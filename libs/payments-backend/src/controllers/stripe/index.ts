import { stripeInstance } from '../../services';
import { Stripe } from 'stripe';

export const createPayment = async (
  currency = 'usd',
  paymentId: string,
  unitAmount = 1,
  quantity = 1,
  fee = 2020202020202020,
  connectedAccountId: string,
  successUrl: string,
) => {
  await stripeInstance.checkout.sessions.create({
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

export const createHostAccount = async (): Promise<Stripe.Account | null> => {
  try {
    return await stripeInstance.accounts.create({
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

export const createHostAccountLink = async (
  accountId: string,
  returnUrl: string,
  refreshUrl: string,
): Promise<Stripe.AccountLink | null> => {
  try {
    return await stripeInstance.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
  } catch (error) {
    console.error(
      'An error occurred when calling the Stripe API to create an account link:',
      error,
    );
    return null;
  }
};

export const createHostAccountAndGetId = async (): Promise<string | null> =>
  (await createHostAccount())?.id || null;

export const createHostAccountAndAccountLink = async (
  returnUrl: string,
  refreshUrl: string,
): Promise<Stripe.AccountLink | null> => {
  const accountId = await createHostAccountAndGetId();
  if (accountId) return createHostAccountLink(accountId, returnUrl, refreshUrl);
  else console.log('error');
  return null;
};
