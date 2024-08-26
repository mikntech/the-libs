import { Router } from 'express';
import { AuthenticatedRequest, Strategy } from '@auth-backend';
import { highOrderHandler } from '@base-backend';
import { SomeEnum, TODO } from '@base-shared';
import { genManageControllers } from '../../../../controllers/auth/manage';

export const manageRouter = <
  UserTypeEnum extends SomeEnum<UserTypeEnum>,
  RequiredFields extends {},
  OptionalFields extends {},
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

  const { requestPasswordReset, resetPassword, updateFullName } =
    genManageControllers(strategy);

  router.put(
    '/update-name',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { newFullName } = req.body;
      return updateFullName(req.user, req.userType, newFullName);
    }),
  );

  router.post(
    '/request-password-reset',
    highOrderHandler((async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { email, userType } = req.body;
      return requestPasswordReset(email, userType);
    }) as TODO),
  );

  router.post(
    '/reset-password',
    highOrderHandler((async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { key, password, passwordAgain, userType } = req.body;
      return resetPassword(key, password, passwordAgain, userType);
    }) as TODO),
  );

  return router;
};
