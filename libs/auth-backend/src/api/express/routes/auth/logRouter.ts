import { AuthenticatedRequest, Strategy } from '@the-libs/auth-backend';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { highOrderHandler } from '@the-libs/express-backend';
import { SomeEnum, TODO } from '@the-libs/base-shared';
import { genLogControllers } from '../../../../controllers/auth/log';

export const logRouter = <
  UserTypeEnum extends string | number | symbol,
  RequiredFields extends {},
  OptionalFields extends {},
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

  return router;
};
