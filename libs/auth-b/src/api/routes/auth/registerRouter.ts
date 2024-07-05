import { Router } from 'express';
import highOrderHandler from 'gbase-b';

const router = Router();

router.post(
  '/request/:accountType',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { email } = req.body;
    const { accountType } = req.params;
    return requestToRegister(email, accountType as AccountType);
  })
);

router.post(
  '/finish',
  highOrderHandler(async (req) => {
    const { key, full_name, phone_number, password, passwordAgain } = req.body;
    return finishRegistration(
      key,
      full_name,
      phone_number,
      password,
      passwordAgain
    );
  })
);

export default router;
