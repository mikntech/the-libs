export * from './log';
export * from './manage';
export * from './register';

import { getBaseSettings } from 'base-backend';
import { Startegy, User } from 'auth-backend';
import {
  findDocs,
  InvalidInputError,
  validateDocument,
  Document,
  sendEmail,
} from 'base-backend';
import { hash, genSalt } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { Model } from 'mongoose';
import zxcvbn from 'zxcvbn';

export const JWT_COOKIE_NAME = 'jwt';

export const genBaseControllers = <UserType>(strategy: Startegy<UserType>) => {
  const getModel = (
    userType?: string,
  ) =>
    strategy.

  const defautGetModelForByCollection = (userType: string) => {};

  const generateJWT = <SCHEMA extends User = User, MultiUserTypeEnum = never>(
    user: SCHEMA,
    MultiUserType?: MultiUserTypeEnum,
  ) =>
    sign(
      {
        id: user._id,
        MultiUserType,
      },
      getBaseSettings().jwtSecret,
    );

  const generateSecureCookie = (name: string, val: string) => ({
    name,
    val,
    options: {
      httpOnly: true,
      sameSite: getBaseSettings().nodeEnv === 'development' ? 'lax' : 'none',
      secure: getBaseSettings().nodeEnv === 'production',
    } as CookieOptions,
  });

  const sendEmailWithLink = (
    email: string,
    subject: string,
    body: string,
    link: string,
  ) => {
    sendEmail(email, subject, body).then(
      () =>
        getBaseSettings().stagingEnv === 'local' &&
        console.log('tried to send email - link is: ' + link),
    );
  };

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError('Password is too weak');
  };

  const validateKey = async <SCHEMA extends Document>(
    model: Model<SCHEMA>,
    key: string,
  ) => {
    const existingRequest = await findDocs<SCHEMA, false>(
      model.findOne({
        key,
      }),
      true,
    );
    if (!existingRequest || !validateDocument(existingRequest as SCHEMA)) {
      throw new InvalidInputError('key (is wrong)');
    }
    return existingRequest as SCHEMA;
  };

  const hashPassword = async (newPassword: string) =>
    hash(newPassword, await genSalt());

  return {
    hashPassword,
    validateKey,
    validatePasswordStrength,
    sendEmailWithLink,
    generateSecureCookie,
    generateJWT,
  };
};
