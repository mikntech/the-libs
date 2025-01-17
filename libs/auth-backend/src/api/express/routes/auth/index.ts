import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { logRouter } from './logRouter';
import { manageRouter } from './manageRouter';
import { registerRouter } from './registerRouter';
import { Strategy } from '../../../../strategy';
import { highOrderHandler } from '@the-libs/express-backend';
import { SomeEnum } from '@the-libs/base-shared';
import { AuthenticatedRequest } from '../../middleware';

export const authRouter = <
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
  router.use('/log', logRouter(strategy));
  router.use('/manage', manageRouter(strategy));
  router.use(
    '/register',
    registerRouter<UserTypeEnum, RequiredFields, OptionalFields>(strategy),
  );

  router.get(
    '/ZXCVBNDifficulty',
    highOrderHandler(async () => ({
      statusCode: 200,
      body: String(strategy.MIN_PASSWORD_STRENGTH),
    })),
  );

  return router;
};
