export * from './log';
export * from './manage';
export * from './register';

import { User } from 'auth-backend';
import {
  findDocs,
  InvalidInputError,
  validateDocument,
  Document,
  sendEmail,
  settings,
} from 'base-backend';
import { hash, genSalt } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { Model } from 'mongoose';
import zxcvbn from 'zxcvbn';
import { MIN_PASSWORD_STRENGTH } from '../../strategy';

export const JWT_COOKIE_NAME = 'jwt';

export const generateJWT = <
  SCHEMA extends User = User,
  AccountTypeEnum = never,
>(
  user: SCHEMA,
  accountType?: AccountTypeEnum,
) =>
  sign(
    {
      id: user._id,
      accountType,
    },
    settings.jwtSecret,
  );

export const generateSecureCookie = (name: string, val: string) => ({
  name,
  val,
  options: {
    httpOnly: true,
    sameSite: settings.nodeEnv === 'development' ? 'lax' : 'none',
    secure: settings.nodeEnv === 'production',
  } as CookieOptions,
});

export const sendEmailWithLink = (
  email: string,
  subject: string,
  body: string,
  link: string,
) => {
  sendEmail(email, subject, body).then(
    () =>
      settings.stagingEnv === 'local' &&
      console.log('tried to send email - link is: ' + link),
  );
};

export const validatePasswordStrength = (password: string) => {
  if (zxcvbn(password).score < MIN_PASSWORD_STRENGTH)
    throw new InvalidInputError('Password is too weak');
};

export const validateKey = async <SCHEMA extends Document>(
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
  return existingRequest as SCHEMA | null;
};

export const hashPassword = async (newPassword: string) =>
  hash(newPassword, await genSalt());
