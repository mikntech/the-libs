import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { genRegisterControllers } from '../../../../controllers/auth/register';
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { TODO } from '@the-libs/base-shared';
import { MultiUserType, Strategy } from '../../../../';

export const registerRouter = <
  UserTypeEnum extends string | number | symbol,
  RequiredFields extends object,
  OptionalFields extends object,
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
