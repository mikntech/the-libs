import { Router } from 'express';
import { AuthenticatedRequest, Strategy } from 'auth-backend';
import { highOrderHandler, TODO } from 'base-backend';
import { genManageControllers } from '../../../controllers/auth/manage';

export const manageRouter = <S>(strategy: Strategy<S>) => {
  const router = Router();

  const { requestPasswordReset, resetPassword } =
    genManageControllers(strategy);

  router.post(
    '/request-password-reset',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      return requestPasswordReset(email);
    }) as TODO),
  );

  router.post(
    '/reset-password',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { key, password, passwordAgain } = req.body;
      return resetPassword(key, password, passwordAgain);
    }) as TODO),
  );

  return router;
};
