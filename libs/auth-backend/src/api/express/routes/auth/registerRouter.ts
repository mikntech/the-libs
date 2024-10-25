import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import {
  AuthenticatedRequest,
  MultiUserType,
  Strategy,
} from '@the-libs/auth-backend';
import { genRegisterControllers } from '../../../../controllers/auth/register';
import { highOrderHandler } from '@the-libs/express-backend';
import { SomeEnum, TODO } from '@the-libs/base-shared';

export const registerRouter = <
  UserTypeEnum extends string | number | symbol,
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

  const { requestToRegister, finishRegistration } = genRegisterControllers<
    UserTypeEnum,
    RequiredFields,
    OptionalFields
  >(strategy);
  router.post(
    '/request' +
      (strategy.multiUserType === MultiUserType.SINGLE ? '' : '/:userType'),
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { email } = req.body;
      const userType = req.params['userType'] as unknown as UserTypeEnum;
      return requestToRegister(email, userType, strategy.genRegisterEmail);
    }) as TODO,
  );

  router.post(
    '/finish',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const {
        key,
        full_name,
        password,
        passwordAgain,
        requiredFields,
        optionalFields,
      } = req.body;
      return finishRegistration(
        key,
        full_name,
        password,
        passwordAgain,
        requiredFields,
        optionalFields,
      );
    }) as TODO,
  );

  return router;
};
