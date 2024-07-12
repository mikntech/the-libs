import { Router } from 'express';
import { MultiUserType } from '../../../strategy';
import { AuthenticatedRequest, User } from 'auth-backend';
import { finishRegistration, requestToRegister } from '../../../controllers';
import { highOrderHandler, TODO } from 'base-backend';

export default <MultiUserTypeEnum = never>(multi: MultiUserType) => {
  const router = Router();

  router.post(
    '/request' + (multi === MultiUserType.SINGLE ? '' : '/:MultiUserType'),
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const MultiUserType =
        multi !== MultiUserType.SINGLE && req.params['MultiUserType'];
      const MultiUserTypeParam: [MultiUserTypeEnum?] = MultiUserType
        ? [MultiUserType as MultiUserTypeEnum]
        : [];
      return requestToRegister<User, MultiUserTypeEnum>(
        email,
        ...(MultiUserTypeParam as TODO),
      );
    }) as unknown as TODO),
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
