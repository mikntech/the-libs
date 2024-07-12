import {
  Document,
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
import zxcvbn from 'zxcvbn';
import { Model } from 'mongoose';
import { genLogControllers } from './log';
import { genManageControllers } from './manage';
import { genRegisterControllers } from './register';

export const JWT_COOKIE_NAME = 'jwt';

export const genAuthControllers = <UserType>(strategy: Strategy<UserType>) => {
  const getModel = (userType?: string) =>
    strategy.multiUserType === MultiUserType.SINGLE
      ? strategy.modelMap
      : strategy.modelMap[userType as keyof typeof strategy.modelMap];

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

  const validateKey = async <SCHEMA extends Document>(
    key: string,
    userType?: string,
  ) => {
    const existingRequest = await findDocs<SCHEMA, false>(
      (getModel(userType) as Model<SCHEMA>).findOne({
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

  const { validateAndProtect, getToken, logIn, logOut } =
    genLogControllers<UserType>(strategy);
  const { requestPasswordReset, resetPassword } =
    genManageControllers<UserType>(strategy);
  const { requestToRegister, finishRegistration } =
    genRegisterControllers<UserType>(strategy);

  return {
    hashPassword,
    validateKey,
    validatePasswordStrength,
    sendEmailWithLink,
    generateSecureCookie,
    generateJWT,

    validateAndProtect,
    logIn,
    logOut,

    requestPasswordReset,
    resetPassword,

    requestToRegister,
    finishRegistration,
  };
};
