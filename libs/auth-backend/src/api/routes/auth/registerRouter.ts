import { Router } from 'express';
import { AuthenticatedRequest, MultiUserType, Strategy } from 'auth-backend';
import { genRegisterControllers } from '../../../controllers/auth/register';
import { GenEmailFunction, highOrderHandler, TODO } from 'base-backend';

export const registerRouter = <S, UserType>(
  genRegisterEmail: GenEmailFunction,
  strategy: Strategy<S>,
  UserTypeEnum: Record<string, string>,
) => {
  const router = Router();

  const { requestToRegister, finishRegistration } = genRegisterControllers(
    strategy,
    UserTypeEnum,
  );

  router.post(
    '/request' +
      (strategy.multiUserType === MultiUserType.SINGLE ? '' : '/:userType'),
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const userType =
        strategy.multiUserType !== MultiUserType.SINGLE &&
        req.params['userType'];
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
