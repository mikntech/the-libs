import { AuthenticatedRequest } from 'auth-backend';
import { Router } from 'express';
import { logIn, logOut, validateAndProtect } from '../../../controllers';
import { highOrderHandler, TODO } from 'base-backend';

const router = Router();

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

export default router;
