import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { getAutodeskToken, translate } from '../../../../controllers/autodesk';

export const autodeskRouter = Router();

autodeskRouter.get(
  '/getToken',
  highOrderHandler(async () => ({
    statusCode: 200,
    body: { token: await getAutodeskToken() },
  })),
);

autodeskRouter.post(
  '/translate',
  highOrderHandler(async (req: AuthenticatedRequest) =>
    translate(req.body.fileUrn),
  ),
);
