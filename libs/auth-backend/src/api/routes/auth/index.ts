import { Router } from 'express';
import { logRouter } from './logRouter';
import { manageRouter } from './manageRouter';
import { registerRouter } from './registerRouter';
import { Strategy } from '../../../strategy';

export const authRouter = <S>(strategy: Strategy<S>) => {
  const router = Router();

  router.use('/log', logRouter(strategy));
  router.use('/manage', manageRouter(strategy));
  router.use('/register', registerRouter(strategy));

  return router;
};
