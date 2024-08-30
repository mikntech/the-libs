import {
  findDocs,
  getBaseSettings,
  NodeEnvironment,
  StagingEnvironment,
  validateDocument,
} from '@the-libs/base-backend';
import { InvalidInputError, TODO, SomeEnum } from '@the-libs/base-shared';
import {
  MultiUserType,
  passResetRequest,
  registrationRequest,
  SomeRequest,
  Strategy,
  User,
  authSettings,
  MultiClientType,
} from '@the-libs/auth-backend';
import { genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { CookieOptions } from 'express';
const zxcvbn = require('zxcvbn');
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Model } = require('mongoose');
import { sendEmail } from '@the-libs/email-backend';

export const JWT_COOKIE_NAME = 'jwt';

export const genAuthControllers = <
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
) => {
  const getModel = (userType: UserType): Model<User> =>
    (strategy.multiUserType === MultiUserType.MULTI_COLLECTION
      ? (strategy.modelMap as TODO)[userType]
      : strategy.modelMap)();

  const generateURLWithParams = (params: string, userType: string) =>
    `${
      strategy.multiClientType === MultiClientType.SINGLE
        ? getBaseSettings().clientDomains[0]
        : getBaseSettings<{
            [key: string]: string;
          }>().clientDomains[userType]
    }/?` + params;

  const generateJWT = ({ _id }: User, userType: UserType) =>
    sign(
      {
        _id,
        userType,
      },
      authSettings.jwtSecret,
    );

  const generateSecureCookie = (
    name: string,
    val: string,
    expirationDate?: Date,
  ) => ({
    name,
    val,
    options: {
      httpOnly: true,
      sameSite:
        getBaseSettings().nodeEnv === NodeEnvironment.Development
          ? 'lax'
          : 'none',
      secure: getBaseSettings().nodeEnv === NodeEnvironment.Production,
      ...(expirationDate ? { expires: expirationDate } : {}),
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
        getBaseSettings().stagingEnv === StagingEnvironment.Local &&
        console.log('tried to send email - link is: ' + link),
    );
  };

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < strategy.MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError('Password is too weak');
  };

  const validateKey = async (key: string, register: boolean) => {
    const existingRequest = await findDocs<false, SomeRequest<true>>(
      (register ? registrationRequest() : passResetRequest()).findOne({
        key,
      }),
      true,
    );
    if (!existingRequest || !validateDocument(existingRequest as TODO)) {
      throw new InvalidInputError('key is wrong');
    }
    return existingRequest as SomeRequest<true>;
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
    generateURLWithParams,
  };
};
