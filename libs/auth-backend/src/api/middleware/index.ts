import { NextFunction, Request, Response } from 'express';
import { authSettings, Strategy, User } from '@auth-backend';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { genAuthControllers } from '../../controllers';
import { SomeEnum, TODO } from '@base-shared';
import { findDocs } from '@base-backend';
const jsonwebtoken = require('jsonwebtoken');

export interface AuthenticatedRequest extends Request {
  user: User | null;
}

export const authorizer =
  <
    UserType extends SomeEnum<UserType>,
    RequiredFields extends {},
    OptionalFields extends {},
  >(
    strategy: Strategy<
      RequiredFields,
      OptionalFields,
      UserType,
      boolean,
      boolean
    >,
  ) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
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
    } catch (err) {
      req.user = null;
    }
    next();
  };
