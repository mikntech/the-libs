import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { createConnectedAccountAndAccountLink } from '../../../../controllers';

export const generateStripeRouter = (returnUrl: string, refreshUrl: string) => {
  const stripeRouter = Router();

  stripeRouter.post(
    '/createAndLinkConnectedAccount',
    highOrderHandler(async () => {
      const body = String(
        await createConnectedAccountAndAccountLink(returnUrl, refreshUrl),
      );
      return { statusCode: 200, body };
    }),
  );

  return stripeRouter;
};
