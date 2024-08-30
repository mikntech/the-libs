import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/base-backend';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { createHostAccountAndAccountLink } from '../../../../controllers';
export const stripeRouter = Router();

stripeRouter.post(
  '/createAndLinkConnectedAccount',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { user } = req.body;
    const body = String(await createHostAccountAndAccountLink('idk', 'idkaa'));
    return { statusCode: 200, body };
  }),
);
