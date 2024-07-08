import { Router } from 'express';
import { AuthenticatedRequest } from 'auth-backend';
import { requestPasswordReset, resetPassword } from '../../../controllers';
import { highOrderHandler } from 'base-backend';

const router = Router();

router.post(
  '/request-password-reset',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { email } = req.body;
    return requestPasswordReset(email);
  }),
);

router.post(
  '/reset-password',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { key, password, passwordAgain } = req.body;
    return resetPassword(key, password, passwordAgain);
  }),
);

export default router;
