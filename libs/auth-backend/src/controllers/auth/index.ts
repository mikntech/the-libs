import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { getExpressSettings } from '@the-libs/express-backend';
import { InvalidInputError, TODO, SomeEnum } from '@the-libs/base-shared';
import {
  MultiUserType,
  passResetRequest,
  registrationRequest,
  Strategy,
  authSettings,
  MultiClientType,
} from '@the-libs/auth-backend';
import { User, SomeRequest } from '@the-libs/auth-shared';

const { genSalt, hash } = require('bcrypt');

const { sign } = require('jsonwebtoken');

import type { CookieOptions } from 'express';
const zxcvbn = require('zxcvbn');

import type { Model } from 'mongoose';
import { sendEmail } from '@the-libs/email-backend';
import {
  findDocs,
  mongoSettings,
  validateDocument,
  NodeEnvironment,
} from '@the-libs/mongo-backend';

export const JWT_COOKIE_NAME = 'jwt';

export const genAuthControllers = <
  UserType extends string | number | symbol,
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
  const getModel = async (userType: UserType): Promise<Model<User>> => {
    if (strategy.multiUserType === MultiUserType.MULTI_COLLECTION) {
      const modelMap = strategy.modelMap as {
        [key in keyof UserType]: () => Promise<Model<User>>;
      };

      const userSpecificModel = modelMap[userType as unknown as keyof UserType];
      if (userSpecificModel) {
        return await userSpecificModel();
      } else {
        throw new Error(`Model not found for user type: ${String(userType)}`);
      }
    } else {
      const singleModel = strategy.modelMap as () => Promise<Model<User>>;
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
        mongoSettings.nodeEnv === NodeEnvironment.Development ? 'lax' : 'none',
      secure: mongoSettings.nodeEnv === NodeEnvironment.Production,
      ...(expirationDate ? { expires: expirationDate } : {}),
    } as CookieOptions,
  });

  const sendEmailWithLink = (
    email: string,
    subject: string,
    body: string,
    link: string,
  ) =>
    (strategy.sendEmails?.[getExpressSettings().stagingEnv] ?? true)
      ? sendEmail(email, subject, body).then()
      : console.log(link);

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < strategy.MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError('Password is too weak');
  };

  const validateKey = async (key: string, register: boolean) => {
    const existingRequest = await findDocs<false, SomeRequest<true>>(
      (register
        ? await registrationRequest()
        : await passResetRequest()
      ).findOne({
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
