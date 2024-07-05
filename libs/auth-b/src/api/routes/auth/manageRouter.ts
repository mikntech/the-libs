import { Router } from 'express';
import { AuthenticatedRequest } from '../../middleware';
import { AccountType } from '@cube-box/shared';
import { highOrderHandler } from '../index';
import { requestPasswordReset, resetPassword } from '../../../controllers';

const router = Router();

router.post(
  '/request-password-reset',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { email } = req.body;
    const { accountType } = req.params;
    return requestPasswordReset(email, accountType as AccountType);
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
