import { createRequire } from 'module';
import { getExpressSettings } from '@the-libs/express-backend';
import { InvalidInputError, TODO } from '@the-libs/base-shared';
import {
  authSettings,
  MultiClientType,
  MultiUserType,
  passResetRequest,
  registrationRequest,
  Strategy,
} from '@the-libs/auth-backend';
import { SomeRequest, User } from '@the-libs/auth-shared';
import type { CookieOptions } from 'express';
import type { Model } from 'mongoose';
import { sendEmail } from '@the-libs/email-backend';
import {
  findDocs,
  mongoSettings,
  NodeEnvironment,
  validateDocument,
} from '@the-libs/mongo-backend';

const require = createRequire(import.meta.url);

const { genSalt, hash } = require('bcrypt');

const { sign } = require('jsonwebtoken');

const zxcvbn = require('zxcvbn');

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
      httpOnly: true, // Keeps the cookie inaccessible from JavaScript
      secure: mongoSettings.nodeEnv === NodeEnvironment.Production, // Ensures cookies are sent over HTTPS in production
      sameSite: 'lax', // Allows cookies to be sent on same-site requests
      path: '/', // Ensures the cookie is available throughout the app
      domain:
        mongoSettings.nodeEnv === NodeEnvironment.Production
          ? '.cubebox.co.il'
          : 'localhost', // Adjust domain for production
      maxAge: 24 * 60 * 60 * 1000, // Optional: Set a lifetime if required (24 hours in this case)
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
