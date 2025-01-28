import {
  ExternalIdentityProviders,
  genLogControllers,
  MultiUserType,
  Strategy,
} from '../../../../';
import { createRequire } from 'module';
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { TODO } from '@the-libs/base-shared';
import { genGoogleControllers } from '../../../../controllers/auth/oauth/google';

const require = createRequire(import.meta.url);
const { Router } = require('express');

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
  const { useGoogle } = genGoogleControllers(strategy);

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

  router.get('/out', highOrderHandler((() => logOut()) as TODO));

  if (
    strategy.externalIdentityProviders.some(
      // until I refactor to map to check in O(1) - constant time complexity
      (provider) => provider === ExternalIdentityProviders.GOOGLE,
    )
  )
    router.get(
      '/useGoogle' +
        (strategy.multiUserType === MultiUserType.SINGLE ? '' : '/:userType'),
      highOrderHandler(
        ({ query, params }: AuthenticatedRequest<UserTypeEnum>) =>
          useGoogle(query['token'], params['userType'] as UserTypeEnum),
      ),
    );

  return router;
};
