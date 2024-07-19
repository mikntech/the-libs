import { Router } from 'express';
import { AuthenticatedRequest, Strategy } from 'auth-backend';
import { highOrderHandler, SomeEnum, TODO } from 'base-backend';
import { genManageControllers } from '../../../controllers/auth/manage';

export const manageRouter = <
  UserTypeEnum extends SomeEnum<UserTypeEnum>,
  RequiredFields = {},
  OptionalFields = {},
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserTypeEnum,
    boolean,
    boolean
  >,
) => {
  const router = Router();

  const { requestPasswordReset, resetPassword } =
    genManageControllers(strategy);

  router.post(
    '/request-password-reset',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      return requestPasswordReset(email);
    }) as TODO),
  );

  router.post(
    '/reset-password',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { key, password, passwordAgain, userType } = req.body;
      return resetPassword(key, password, passwordAgain, userType);
    }) as TODO),
  );

  return router;
};
