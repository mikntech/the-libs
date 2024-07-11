import { sign } from 'jsonwebtoken';
import {
  createDoc,
  findDocs,
  InvalidInputError,
  validateDocument,
  validateInput,
  GenEmailFunction,
  UnauthorizedError,
  TODO,
  baseSettings,
} from 'base-backend';
import {
  generateSecureCookie,
  hashPassword,
  JWT_COOKIE_NAME,
  sendEmailWithLink,
  validateKey,
  validatePasswordStrength,
} from './index';
import { Model } from 'mongoose';
import { defaultGenPassResetEmail } from '../../services';
import { v4 } from 'uuid';
import { passResetRequest, PassResetRequest, user, User } from 'auth-backend';

const createKeyForPassReset = async (email: string) => {
  const key = v4();
  await createDoc(passResetRequest(), {
    email,
    key,
  });
  return `${(baseSettings as TODO).clientDomain}/?reset-code=${key}`;
};

export const requestPasswordReset = async <SCHEMA extends User>(
  email: string,
  genPassResetEmail: GenEmailFunction = defaultGenPassResetEmail,
  model: Model<SCHEMA> = user(false, false) as TODO,
) => {
  validateInput({ email });
  const userDoc = await findDocs<SCHEMA, false>(model.findOne({ email }), true);
  if (!userDoc || !validateDocument(userDoc as SCHEMA))
    throw new InvalidInputError('No user found with this email');
  const url = await createKeyForPassReset(email);
  const { subject, body } = genPassResetEmail(url);
  sendEmailWithLink(email, subject, body, url);
  return { code: 200, body: 'email sent successfully' };
};

const changeUsersPassword = async <SCHEMA extends User>(
  user: SCHEMA,
  password: string,
) => {
  user.password = password;
  await user.save();
  return sign(
    {
      id: user._id,
    },
    (baseSettings as TODO).jwtSecret,
  );
};

export const resetPassword = async <SCHEMA extends User = User>(
  key: string,
  password: string,
  passwordAgain: string,
  model: Model<SCHEMA> = user(false, false) as TODO,
) => {
  validateInput({ key });
  validateInput({ password });
  validateInput({ passwordAgain });
  if (password !== passwordAgain)
    throw new InvalidInputError("Passwords don't match");
  validatePasswordStrength(password);
  const { email } = await validateKey<PassResetRequest>(
    passResetRequest(),
    key,
  );
  const existingUser = await findDocs<SCHEMA, false>(
    model.findOne({
      email,
    }),
  );
  if (!existingUser) throw new UnauthorizedError('what?');
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      await changeUsersPassword(existingUser, await hashPassword(password)),
    ),
  };
};
