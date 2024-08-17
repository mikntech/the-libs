import { Router } from 'express';
import { highOrderHandler } from '@base-backend';
import { AuthenticatedRequest } from '@auth-backend';
import { createHostAccountAndAccountLink } from '../../../controllers';
export const stripeRouter = Router();

stripeRouter.post(
  '/createAndLinkConnectedAccount',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { user } = req.body;
    const body = String(await createHostAccountAndAccountLink('idk', 'idkaa'));
    return { statusCode: 200, body };
  }),
);
