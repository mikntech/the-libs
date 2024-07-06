import { PassResetRequest, User } from 'auth-b';
import { sign } from 'jsonwebtoken';
import settings from '../../../../gbase-b/src/config';
import {
  findDocs,
  InvalidInputError,
  validateDocument,
  validateInput,
} from 'gbase-b';
import passResetRequest from '../../schemas/auth/passResetRequest';
import {
  generateSecureCookie,
  hashPassword,
  JWT_COOKIE_NAME,
  validateKey,
  validatePasswordStrength,
} from './index';
import { GenEmailFunction } from '../../../../gbase-b/src/services';
import { Model } from 'mongoose';
import user from '../../schemas/auth/user';
import { defaultGenPassResetEmail } from '../../services';

export const requestPasswordReset = async <SCHEMA extends User>(
  email: string,
  genPassResetEmail?: GenEmailFunction,
  model: Model<SCHEMA> = user(),
) => {
  validateInput({ email });
  const userDoc = await findDocs<SCHEMA, false>(model.findOne({ email }), true);
  if (!userDoc || !validateDocument(userDoc as SCHEMA))
    throw new InvalidInputError('No user found with this email');
  const url = await createKeyForPassReset(email);
  const { subject, body } = genPassResetEmail || defaultGenPassResetEmail(url);
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
    settings.jwtSecret,
  );
};

export const resetPassword = async <SCHEMA extends User = User>(
  key: string,
  password: string,
  passwordAgain: string,
  model: Model<SCHEMA> = user(),
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
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      await changeUsersPassword(existingUser, await hashPassword(password)),
    ),
  };
};
