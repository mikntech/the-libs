import { Strategy, genLogControllers } from '../../../../';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { TODO } from '@the-libs/base-shared';
import { genGoogleControllers } from '../../../../controllers/auth/oauth/google';

export const logRouter = <
  UserTypeEnum extends string | number | symbol,
  RequiredFields extends object,
  OptionalFields extends object,
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserTypeEnum,
    boolean,
    boolean
  >,
) => {
  const router = Router();

  const { validateAndProtect, logIn, logOut } = genLogControllers(strategy);
  const { google } = genGoogleControllers(strategy);

  router.get(
    '/',
    highOrderHandler((async (req: AuthenticatedRequest<UserTypeEnum>) => ({
      statusCode: 200,
      body: validateAndProtect(req.user as TODO),
    })) as TODO),
  );

  router.post(
    '/in',
    highOrderHandler((async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { email, password, userType } = req.body;
      return logIn(email, password, userType);
    }) as TODO),
  );

  router.get(
    '/out',
    highOrderHandler(((_: AuthenticatedRequest<UserTypeEnum>) =>
      logOut()) as TODO),
  );

  router.get(
    '/google/:userType',
    highOrderHandler(({ query, params }: AuthenticatedRequest<UserTypeEnum>) =>
      google(query['token'], params['userType'] as UserTypeEnum),
    ),
  );

  return router;
};
