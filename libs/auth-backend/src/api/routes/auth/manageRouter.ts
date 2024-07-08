import { Router } from 'express';
import { AuthenticatedRequest } from 'auth-backend';
import { requestPasswordReset, resetPassword } from '../../../controllers';
import { highOrderHandler, TODO } from 'base-backend';

const router = Router();

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

export default router;
