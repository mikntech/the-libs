export * from './log';
export * from './manage';
export * from './register';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { getExpressSettings } from '@the-libs/express-backend';
import {
  InvalidInputError,
  NodeEnvironment,
  NotLoggedInError,
  TODO,
} from '@the-libs/base-shared';
import {
  MultiUserType,
  passResetRequest,
  registrationRequest,
  Strategy,
  authSettings,
  MultiClientType,
} from '../../';
import { User, SomeRequest } from '@the-libs/auth-shared';

const { genSalt, hash } = require('bcrypt');

const { sign } = require('jsonwebtoken');

import type { CookieOptions } from 'express';
const zxcvbn = require('zxcvbn');

import { sendEmail } from '@the-libs/email-backend';
import {
  findDocs,
  mongoSettings,
  validateDocument,
  ExtendedModel,
} from '@the-libs/mongo-backend';

export const JWT_COOKIE_NAME = 'jwt';

export const genAuthControllers = <
  UserType extends string | number | symbol,
  RequiredFields extends object,
  OptionalFields extends object,
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserType,
    boolean,
    boolean
  >,
) => {
  const getModel = async (
    userType?: UserType,
  ): Promise<ExtendedModel<User>> => {
    if (strategy.multiUserType === MultiUserType.MULTI_COLLECTION) {
      const modelMap = strategy.modelMap as {
        [key in keyof UserType]: () => Promise<ExtendedModel<User>>;
      };

      const userSpecificModel = modelMap[userType as unknown as keyof UserType];
      if (userSpecificModel) {
        return await userSpecificModel();
      } else {
        throw new Error(`Model not found for user type: ${String(userType)}`);
      }
    } else {
      const singleModel = strategy.modelMap as () => Promise<
        ExtendedModel<User>
      >;
      return await singleModel();
    }
  };

  const generateURLWithParams = (params: string, userType: string) =>
    `${
      strategy.multiClientType === MultiClientType.SINGLE
        ? getExpressSettings<{ single: string }>().clientDomains.single
        : getExpressSettings<{
            [key: string]: string;
          }>().clientDomains[userType]
    }/?` + params;

  const generateJWT = ({ _id }: User, userType?: UserType) =>
    sign(
      {
        _id,
        userType,
      },
      authSettings.jwtSecret,
    );

  const getClientDomain = (userType: string) =>
    strategy.multiClientType === MultiClientType.SINGLE
      ? getExpressSettings<{ single: string }>().clientDomains.single
      : getExpressSettings<{
          [key: string]: string;
        }>().clientDomains[userType];

  const generateSecureCookie = (
    name: string,
    val: string,
    expirationTime: number = 24 * 60 * 60 * 1000,
  ) => ({
    name,
    val,
    options: {
      path: '/',
      domain:
        mongoSettings.nodeEnv === NodeEnvironment.Production
          ? '.' + getExpressSettings().topDomain
          : '127.0.0.1',
      maxAge: expirationTime,
      httpOnly: true,
      sameSite:
        mongoSettings.nodeEnv === NodeEnvironment.Development ? 'lax' : 'none',
      secure: mongoSettings.nodeEnv === NodeEnvironment.Production,
    } as CookieOptions,
  });

  const sendEmailWithLink = (
    email: string,
    subject: string,
    body: string,
    link: string,
  ) =>
    (strategy.sendEmails?.[mongoSettings.stagingEnv] ?? true)
      ? sendEmail(email, subject, body).then()
      : console.log(link);

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < strategy.MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError('Password is too weak');
  };

  const validateKey = async (key: string, register: boolean) => {
    const m = await (register ? registrationRequest() : passResetRequest());
    const existingRequest = await findDocs<false, SomeRequest<true>>(
      m,
      m.findOne({
        key,
      }) as TODO,
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

export const endpointAuthorizer = ({ user }: { user: TODO }) => {
  if (!user) throw new NotLoggedInError();
};
