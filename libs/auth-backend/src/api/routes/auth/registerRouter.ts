import { Router } from 'express';
import { MultiUserType } from '../../../strategy';
import { AuthenticatedRequest, User } from 'auth-backend';
import { finishRegistration, requestToRegister } from '../../../controllers';
import { highOrderHandler, TODO } from 'base-backend';

export default <AccountTypeEnum = never>(multi: MultiUserType) => {
  const router = Router();

  router.post(
    '/request' + (multi === MultiUserType.SINGLE ? '' : '/:accountType'),
    highOrderHandler(
      (async (req: AuthenticatedRequest) => {
        const { email } = req.body;
        const accountType =
          multi !== MultiUserType.SINGLE && req.params['accountType'];
        const accountTypeParam: [AccountTypeEnum?] = accountType
          ? [accountType as AccountTypeEnum]
          : [];
        return requestToRegister<User, AccountTypeEnum>(
          email,
          ...accountTypeParam as TODO,
        );
      }) as unknown as TODO  ),

  );

  router.post(
    '/finish',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { key, full_name, phone_number, password, passwordAgain } =
        req.body;
      return finishRegistration(
        key,
        full_name,
        phone_number,
        password,
        passwordAgain,
      );
    }) as unknown as TODO),
  );

  return router;
};
