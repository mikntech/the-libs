import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { AuthenticatedRequest } from '@the-libs/auth-backend';
import { encodeUrn, getToken } from '../../../../controllers/autodesk';
import { s3Settings } from '@the-libs/s3-backend';

export const autodeskRouter = Router();

autodeskRouter.get(
  '/getToken',
  highOrderHandler(async () => ({
    statusCode: 200,
    body: { token: await getToken() },
  })),
);

autodeskRouter.get(
  '/getEncodedUrn',
  highOrderHandler(async (req: AuthenticatedRequest) => ({
    statusCode: 200,
    body: encodeUrn(s3Settings.s3BucketName, req.body.fileUrn),
  })),
);
