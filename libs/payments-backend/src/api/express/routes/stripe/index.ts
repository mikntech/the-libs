import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { createConnectedAccountAndAccountLink } from '../../../../controllers';

export const generateStripeRouter = (returnUrl: string, refreshUrl: string) => {
  const stripeRouter = Router();

  stripeRouter.post(
    '/createAndLinkConnectedAccount',
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { user } = req.body;
      const body = String(
        await createConnectedAccountAndAccountLink(returnUrl, refreshUrl),
      );
      return { statusCode: 200, body };
    }),
  );

  return stripeRouter;
};
