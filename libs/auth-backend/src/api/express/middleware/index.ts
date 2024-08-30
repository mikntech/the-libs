import { NextFunction, Request, Response } from 'express';
import { authSettings, Strategy, User } from '@the-libs/auth-backend';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { genAuthControllers } from '../../../controllers';
import { SomeEnum, TODO } from '@the-libs/base-shared';
import { findDocs } from '@the-libs/base-backend';
const jsonwebtoken = require('jsonwebtoken');

export interface AuthenticatedRequest<
  UserType = string,
  UserI extends User = User,
> extends Request {
  user: UserI | null;
  userType: UserType;
}

export const authorizer =
  <
    UserType extends SomeEnum<UserType>,
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
      const validatedUser = (await jsonwebtoken.verify(
        req.cookies['jwt'],
        authSettings.jwtSecret,
      )) as JwtPayload;
      const { _id, userType } = validatedUser as {
        _id: Types.ObjectId;
        userType: UserType;
      };
      const { getModel } = genAuthControllers(strategy);
      req.user = await findDocs<false, TODO>(
        getModel(userType).findById(String(_id)),
      );
      req.userType = userType;
    } catch (err) {
      req.user = null;
    }
    next();
  };
