import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { AuthenticatedRequest, Strategy } from '@the-libs/auth-backend';
import { highOrderHandler } from '@the-libs/express-backend';
import { SomeEnum } from '@the-libs/base-shared';
import { genManageControllers } from '../../../../controllers/auth/manage';
const multer = require('multer');

export const manageRouter = <
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

  const {
    requestPasswordReset,
    resetPassword,
    updateFullName,
    updatePhone,
    uploadProfilePicture,
  } = genManageControllers(strategy);

  router.put(
    '/update-name',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { newFullName } = req.body;
      return updateFullName(req.user, req.userType, newFullName);
    }),
  );

  router.put(
    '/update-phone',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { phone } = req.body;
      return updatePhone(req.user, req.userType, phone);
    }),
  );

  router.post(
    '/request-password-reset',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { email, userType } = req.body;
      return requestPasswordReset(email, userType);
    }),
  );

  router.post(
    '/reset-password',
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) => {
      const { key, password, passwordAgain, userType } = req.body;
      return resetPassword(key, password, passwordAgain, userType);
    }),
  );

  const upload = multer({ storage: multer.memoryStorage() });

  router.post(
    '/upload-profile-picture',
    upload.array('files', 1),
    highOrderHandler(async (req: AuthenticatedRequest<UserTypeEnum>) =>
      uploadProfilePicture(req),
    ),
  );

  return router;
};
