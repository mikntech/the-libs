import { Router } from 'express';
import { AuthenticatedRequest, MultiUserType, Strategy } from 'auth-backend';
import { genRegisterControllers } from '../../../controllers/auth/register';
import { highOrderHandler, SomeEnum, TODO } from 'base-backend';
import { GenEmailFunction } from 'email-backend';

export const registerRouter = <UserTypeEnum extends SomeEnum<UserTypeEnum>>(
  genRegisterEmail: GenEmailFunction,
  strategy: Strategy<UserTypeEnum, boolean>,
  enumValues: UserTypeEnum[],
  onCreateFields: {},
) => {
  const router = Router();

  const { requestToRegister, finishRegistration } = genRegisterControllers(
    strategy,
    enumValues,
    onCreateFields,
  );

  router.post(
    '/request' +
      (strategy.multiUserType === MultiUserType.SINGLE ? '' : '/:userType'),
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const userType = req.params['userType'] as unknown as UserTypeEnum;
      return requestToRegister(email, userType, genRegisterEmail);
    }) as TODO,
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
    }) as TODO,
  );

  return router;
};
