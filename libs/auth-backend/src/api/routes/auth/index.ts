import { Router } from 'express';
import { logRouter } from './logRouter';
import { manageRouter } from './manageRouter';
import { registerRouter } from './registerRouter';
import { Strategy } from '../../../strategy';
import { GenEmailFunction } from 'base-backend';

export const authRouter = <S, UserType = S>(
  genRegisterEmail: GenEmailFunction,
  strategy: Strategy<S>,
  UserTypeEnum: Record<string, string>,
  onCreateFields: {},
) => {
  const router = Router();

  router.use('/log', logRouter(strategy, UserTypeEnum));
  router.use('/manage', manageRouter(strategy));
  router.use(
    '/register',
    registerRouter(genRegisterEmail, strategy, UserTypeEnum, onCreateFields),
  );

  return router;
};
