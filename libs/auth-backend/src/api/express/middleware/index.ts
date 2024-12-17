import type { NextFunction, Request, Response } from 'express';
import { User } from '@the-libs/auth-shared';
import type { JwtPayload } from 'jsonwebtoken';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Types } from 'mongoose';
import { genAuthControllers } from '../../../controllers';
import { SomeEnum, TODO } from '@the-libs/base-shared';
import { findDocs } from '@the-libs/mongo-backend';
import { preSignFile } from '@the-libs/s3-backend';
import { Strategy } from '../../../strategy';
import { authSettings } from '../../../config';
const jsonwebtoken = require('jsonwebtoken');

export interface AuthenticatedRequest<
  UserType = string,
  UserI extends User = User,
> extends Request {
  user: UserI | null;
  userType: UserType;
}

export const signProfilePic = async <UserI extends User = User>(
  user: UserI,
) => {
  const s3Path = user.profilePictureUri;
  if (s3Path)
    try {
      user.profilePictureUri = await preSignFile(s3Path, 10 * 60);
    } catch {
      console.log('no profile picture');
      user.profilePictureUri = s3Path;
    }
  return user;
};

export const authorizer =
  <
    UserType extends string | number | symbol,
    RequiredFields extends {},
    OptionalFields extends {},
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
      console.log('req.headers.cookie: ', req.headers.cookie);
      console.log("req.cookies['jwt']: ", req.cookies['jwt']);
      console.log('authSettings.jwtSecret: ', authSettings.jwtSecret);
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
    } catch (err) {
      req.user = null;
    }
    next();
  };
