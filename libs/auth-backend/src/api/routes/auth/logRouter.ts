import { AuthenticatedRequest, Strategy } from 'auth-backend';
import { Router } from 'express';
import { highOrderHandler, TODO } from 'base-backend';
import { genLogControllers } from '../../../controllers/auth/log';

export const logRouter = <S>(strategy: Strategy<S>) => {
  const router = Router();

  const { validateAndProtect, logIn, logOut } = genLogControllers(strategy);

  router.get(
    '/',
    highOrderHandler((async (req: AuthenticatedRequest) => ({
      code: 200,
      body: validateAndProtect(req.user as TODO),
    })) as TODO),
  );

  router.post(
    '/in',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email, MultiUserType, password } = req.body;
      return logIn(email, MultiUserType, password);
    }) as TODO),
  );

  router.get(
    '/out',
    highOrderHandler(((_: AuthenticatedRequest) => logOut()) as TODO),
  );

  return router;
};
