import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const axios = require('axios');
import { paymentsSettings } from '../config';

async function getAccessToken() {
  const res = await axios({
    url: `${paymentsSettings.ppbaseURL}/v1/oauth2/token`,
    method: 'post',
    auth: {
      username: paymentsSettings.ppclientId,
      password: paymentsSettings.ppclientSecret,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  });

  return res.data.access_token;
}

export async function createOrder(amount: string) {
  const token = await getAccessToken();

  const res = await axios.post(
    `${paymentsSettings.ppbaseURL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data;
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await axios.post(
    `${paymentsSettings.ppbaseURL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data;
}
