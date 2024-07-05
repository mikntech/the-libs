import { Router } from 'express';
import { MultiUserTypes } from '../../../config';
import { AuthenticatedRequest, User } from 'auth-b';
import { finishRegistration, requestToRegister } from '../../../controllers';
import { highOrderHandler } from 'gbase-b';

export default <AccountTypeEnum = never>(multi: MultiUserTypes) => {
  const router = Router();

  router.post(
    '/request' + (multi === MultiUserTypes.SINGLE ? '' : '/:accountType'),
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const accountType =
        multi !== MultiUserTypes.SINGLE && req.params['accountType'];
      const accountTypeParam: [AccountTypeEnum?] = accountType
        ? [accountType as AccountTypeEnum]
        : [];
      return requestToRegister<User, AccountTypeEnum>(
        email,
        ...accountTypeParam,
      );
    }),
  );

  router.post(
    '/finish',
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { key, full_name, phone_number, password, passwordAgain } =
        req.body;
      return finishRegistration(
        key,
        full_name,
        phone_number,
        password,
        passwordAgain,
      );
    }),
  );

  return router;
};
