import type { NextFunction, Response } from 'express';
import { User } from '@the-libs/auth-shared';
import type { JwtPayload } from 'jsonwebtoken';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Types } from 'mongoose';
import { genAuthControllers } from '../../../controllers';
import { TODO } from '@the-libs/base-shared';
import { findDocs } from '@the-libs/mongo-backend';
import { preSignFile } from '@the-libs/s3-backend';
import { Strategy } from '../../../strategy';
import { authSettings } from '../../../config';
import { AuthenticatedRequest } from '@the-libs/express-backend';
const jsonwebtoken = require('jsonwebtoken');

export const signProfilePic = async <UserI extends User = User>(
  user: UserI,
) => {
  const s3Path = user.profilePictureUri;
  if (s3Path)
    try {
      user.profilePictureUri = await preSignFile(s3Path, 10 * 60);
    } catch {
      user.profilePictureUri = s3Path;
    }
  return user;
};

export const authorizer =
  <
    UserType extends string | number | symbol,
    RequiredFields extends object,
    OptionalFields extends object,
    UserI extends User,
  >(
    strategy: Strategy<
      RequiredFields,
      OptionalFields,
      UserType,
      boolean,
      boolean
    >,
  ) =>
  async (
    req: AuthenticatedRequest<UserType, UserI>,
    _: Response,
    next: NextFunction,
  ) => {
    try {
      const validatedUser = (await jsonwebtoken.verify(
        req.cookies['jwt'],
        authSettings.jwtSecret,
      )) as JwtPayload;
      const { _id, userType } = validatedUser as {
        _id: Types.ObjectId;
        userType: UserType;
      };
      const { getModel } = genAuthControllers(strategy);
      const m = await getModel(userType);
      req.user = await signProfilePic<UserI>(
        await findDocs<false, TODO>(m, m.findById(String(_id))),
      );
      req.userType = userType;
    } catch {
      req.user = null;
    }
    next();
  };

export const dontAuth = (
  r: AuthenticatedRequest,
  _: Response,
  next: NextFunction,
) => {
  r.dontAuth = true;
  next();
};
