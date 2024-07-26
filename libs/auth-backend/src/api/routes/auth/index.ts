import { Router } from 'express';
import { logRouter } from './logRouter';
import { manageRouter } from './manageRouter';
import { registerRouter } from './registerRouter';
import { Strategy } from '../../../strategy';
import { SomeEnum } from 'base-backend';

export const authRouter = <
  UserTypeEnum extends SomeEnum<UserTypeEnum>,
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
  router.use('/register', registerRouter(strategy));

  return router;
};
