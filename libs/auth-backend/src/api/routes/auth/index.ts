import { Router } from 'express';
import { logRouter } from './logRouter';
import { manageRouter } from './manageRouter';
import { registerRouter } from './registerRouter';
import { Strategy } from '../../../strategy';
import { GenEmailFunction } from 'email-backend';
import { SomeEnum } from 'base-backend';

export const authRouter = <UserTypeEnum extends SomeEnum<UserTypeEnum>>(
  genRegisterEmail: GenEmailFunction,
  strategy: Strategy<UserTypeEnum, boolean>,
  enumValues: UserTypeEnum[],
  onCreateFields: {},
) => {
  const router = Router();

  router.use('/log', logRouter(strategy, enumValues));
  router.use('/manage', manageRouter(strategy));
  router.use(
    '/register',
    registerRouter(genRegisterEmail, strategy, enumValues, onCreateFields),
  );

  return router;
};
