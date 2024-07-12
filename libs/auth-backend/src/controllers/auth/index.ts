import {
  findDocs,
  getBaseSettings,
  InvalidInputError,
  NodeEnvironment,
  sendEmail,
  StagingEnvironment,
  validateDocument,
} from 'base-backend';
import { MultiUserType, Strategy, User } from 'auth-backend';
import { genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { CookieOptions } from 'express';
const zxcvbn = require('zxcvbn');
import { Model } from 'mongoose';

export const JWT_COOKIE_NAME = 'jwt';

export const genAuthControllers = <UserType>(strategy: Strategy<UserType>) => {
  const getModel = (userType?: string): Model<User> =>
    (strategy.multiUserType === MultiUserType.SINGLE
      ? strategy.modelMap
      : strategy.modelMap[
          userType as keyof typeof strategy.modelMap
        ]) as unknown as Model<User>;

  const generateJWT = <SCHEMA extends User = User>(
    user: SCHEMA,
    userType?: string,
  ) =>
    sign(
      {
        id: user._id,
        userType,
      },
      getBaseSettings().jwtSecret,
    );

  const generateSecureCookie = (name: string, val: string) => ({
    name,
    val,
    options: {
      httpOnly: true,
      sameSite:
        getBaseSettings().nodeEnv === NodeEnvironment.development
          ? 'lax'
          : 'none',
      secure: getBaseSettings().nodeEnv === NodeEnvironment.production,
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
        getBaseSettings().stagingEnv === StagingEnvironment.local &&
        console.log('tried to send email - link is: ' + link),
    );
  };

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < strategy.MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError('Password is too weak');
  };

  const validateKey = async (key: string, userType?: string) => {
    const existingRequest = await findDocs(
      getModel(userType).findOne({
        key,
      }),
      true,
    );
    if (!existingRequest || !validateDocument(existingRequest as any)) {
      throw new InvalidInputError('key (is wrong)');
    }
    return existingRequest;
  };

  const hashPassword = async (newPassword: string) =>
    hash(newPassword, await genSalt());

  return {
    getModel,
    hashPassword,
    validateKey,
    validatePasswordStrength,
    sendEmailWithLink,
    generateSecureCookie,
    generateJWT,
  };
};
