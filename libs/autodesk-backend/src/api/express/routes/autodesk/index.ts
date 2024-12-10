import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { encodeUrn, getToken } from '../../../../controllers/autodesk';
import { autodeskSettings } from '../../../../config';

export const autodeskRouter = Router();

autodeskRouter.get(
  '/token',
  highOrderHandler(async () => ({
    statusCode: 200,
    body: { token: await getToken() },
  })),
);

autodeskRouter.get(
  '/encodedUrn/:fileUrn',
  highOrderHandler(async (req: AuthenticatedRequest) => ({
    statusCode: 200,
    body: encodeUrn(autodeskSettings.autodeskBucketName, req.params['fileUrn']),
  })),
);
