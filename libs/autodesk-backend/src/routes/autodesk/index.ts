import { getForgeToken } from '../../controllers/autodesk';
import { highOrderHandler, TODO } from 'base-backend';
import { Router } from 'express';
import { AuthenticatedRequest } from 'auth-backend';

export const autodeskRouter = Router();

let forgeToken = '';

autodeskRouter.get(
  '/getToken',
  highOrderHandler((async (req: AuthenticatedRequest) => {
    try {
      if (!forgeToken) {
        forgeToken = await getForgeToken(
          String(req.query['code']),
          String(req.query['redirectUri']),
        );
      }
      return { statusCode: 200, body: { access_token: forgeToken } };
    } catch (error) {
      throw new Error('Failed to authenticate with Autodesk');
    }
  }) as TODO),
);
