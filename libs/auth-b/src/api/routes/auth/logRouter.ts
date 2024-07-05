import { AuthenticatedRequest } from 'auth-b';
import { Router } from 'express';
import { logIn, logOut, validateAndProtect } from '../../../controllers';
import { highOrderHandler } from 'gbase-b';

const router = Router();

router.get(
  '/',
  highOrderHandler(async (req: AuthenticatedRequest) => ({
    code: 200,
    body: validateAndProtect(req.user),
  })),
);

router.post(
  '/in',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { email, accountType, password } = req.body;
    return logIn(email, accountType, password);
  }),
);

router.get(
  '/out',
  highOrderHandler((_) => logOut()),
);

export default router;
