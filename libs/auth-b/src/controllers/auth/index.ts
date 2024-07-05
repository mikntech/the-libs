import {
  AccountType,
  InvalidInputError,
  MIN_PASSWORD_STRENGTH,
  PassResetRequest,
  RegistrationRequest,
  UnauthorizedError,
  User,
} from '@cube-box/shared';
import { validateDocument, validateEnum, validateInput } from '../validations';
import { createDoc, findDocs } from '../data';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import settings from '../../config';
import { CookieOptions } from 'express';
import passResetRequest from '../../data/auth/passResetRequest';
import { v4 } from 'uuid';
import { genPassResetEmail, genRegisterEmail } from '../../content';
import { sendEmail } from '../../services/email/sendEmail';
import zxcvbn from 'zxcvbn';
import registrationRequest from '../../data/auth/registrationRequest';
import { Document, Model } from 'mongoose';
import admin from '../../data/auth/admin';
import contractor from '../../data/auth/contractor';
import customer from '../../data/auth/customer';

const JWT_COOKIE_NAME = 'jwt';

const protectUsersPassword = (user: User) => {
  user.password = 'secret';
  return user;
};

export const validateAndProtect = (user: User) => {
  if (!validateDocument(user))
    throw new UnauthorizedError(
      "Your are not logged in or your jwt couldn't parsed, please log in and try again"
    );
  return protectUsersPassword(user);
};

const validateCorrectPassword = async (user: User, password: string) => {
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (isPasswordCorrect) return true;
  else throw new UnauthorizedError('Wrong password');
};

const generateJWT = <SCHEMA extends User>(
  user: SCHEMA,
  accountType: AccountType
) =>
  jsonwebtoken.sign(
    {
      id: user._id,
      accountType,
    },
    settings.jwtSecret
  );

const getToken = async <SCHEMA extends User>(
  email: string,
  password: string,
  accountType: AccountType
) => {
  validateInput({ email });
  validateInput({ password });
  const existingUser = await findDocs<SCHEMA, false>(
    getModelForAccountType(accountType).findOne({ email }),
    true
  );
  if (!validateDocument(existingUser))
    throw new UnauthorizedError('Please register');
  if (await validateCorrectPassword(existingUser, password))
    return generateJWT<SCHEMA>(existingUser as SCHEMA, accountType);
};

const generateSecureCookie = (name: string, val: string) => ({
  name,
  val,
  options: {
    httpOnly: true,
    sameSite: settings.nodeEnv === 'development' ? 'lax' : 'none',
    secure: settings.nodeEnv === 'production',
  } as CookieOptions,
});

export const logIn = async (
  email: string,
  accountType: AccountType,
  password: string
) => {
  validateInput({ email });
  validateInput({ password });
  validateInput({ accountType });
  validateEnum({ accountType }, AccountType);
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      await getToken(email, password, accountType)
    ),
  };
};

export const logOut = async () => ({
  code: 200,
  cookie: generateSecureCookie(JWT_COOKIE_NAME, ''),
});

const createKeyForPassReset = async (
  email: string,
  accountType: AccountType
) => {
  const key = v4();
  await createDoc(passResetRequest(), {
    email,
    accountType,
    key,
  });
  return `${settings.clientDomain}/?reset-code=${key}`;
};

const sendEmailWithLink = (
  email: string,
  subject: string,
  body: string,
  link: string
) =>
  sendEmail(email, subject, body).then(
    () =>
      settings.stagingEnv === 'local' &&
      console.log('tried to send email - link is: ' + link)
  );

export const requestPasswordReset = async <SCHEMA extends User>(
  email: string,
  accountType: AccountType
) => {
  validateInput({ email });
  const userDoc = await findDocs<SCHEMA, false>(
    getModelForAccountType(accountType).findOne({ email }),
    true
  );
  if (!validateDocument(userDoc))
    throw new InvalidInputError('No user found with this email');
  const url = await createKeyForPassReset(email, accountType);
  const { subject, body } = genPassResetEmail(url);
  await sendEmailWithLink(email, subject, body, url);
  return { code: 200, body: 'email sent successfully' };
};

const validatePasswordStrength = (password: string) => {
  if (zxcvbn(password).score < MIN_PASSWORD_STRENGTH)
    throw new InvalidInputError('Password is too weak');
};

const validateKey = async <SCHEMA>(model: Model<SCHEMA>, key: string) => {
  const existingRequest = await findDocs<SCHEMA, false>(
    model.findOne({
      key,
    }),
    true
  );
  if (!validateDocument(existingRequest as Document)) {
    throw new InvalidInputError('key (is wrong)');
  }
  return existingRequest as SCHEMA | null;
};

const hashPassword = async (newPassword: string) =>
  bcrypt.hash(newPassword, await bcrypt.genSalt());

const changeUsersPassword = async <SCHEMA extends User>(
  user: SCHEMA,
  password: string
) => {
  user.password = password;
  await user.save();
  return jsonwebtoken.sign(
    {
      id: user._id,
    },
    settings.jwtSecret
  );
};

export const resetPassword = async <SCHEMA extends User>(
  key: string,
  password: string,
  passwordAgain: string
) => {
  validateInput({ key });
  validateInput({ password });
  validateInput({ passwordAgain });
  if (password !== passwordAgain)
    throw new InvalidInputError("Passwords don't match");
  validatePasswordStrength(password);
  const { email, accountType } = await validateKey<PassResetRequest>(
    passResetRequest(),
    key
  );
  const existingUser = await findDocs<SCHEMA, false>(
    getModelForAccountType(accountType).findOne({
      email,
    })
  );
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      await changeUsersPassword(existingUser, await hashPassword(password))
    ),
  };
};

export const getModelForAccountType = <SCHEMA extends User>(
  accountType: AccountType
): Model<SCHEMA> => {
  let model: Model<any>;
  switch (accountType) {
    case AccountType.ADMIN:
      model = admin();
      break;
    case AccountType.CUSTOMER:
      model = customer();
      break;
    case AccountType.CONTRACTOR:
      model = contractor();
      break;
    default:
      throw new Error(`Unsupported account type: ${accountType}`);
  }
  return model as Model<SCHEMA>;
};

const validateEmailNotInUse = async <SCHEMA extends User>(
  email: string,
  accountType: AccountType
) => {
  const userModel = getModelForAccountType<SCHEMA>(accountType);
  const existingUser = await findDocs<SCHEMA, false>(
    userModel.findOne({ email }),
    true
  );
  if (existingUser)
    throw new InvalidInputError(
      'An account with this email already exists. Please try to login instead.'
    );
};

const createKeyForRegistration = async (
  email: string,
  accountType: AccountType
) => {
  const key = v4();
  await createDoc(registrationRequest(), {
    email,
    accountType,
    key,
  });
  return `${settings.clientDomain}/?register-code=${key}`;
};

export const requestToRegister = async <SCHEMA extends User>(
  email: string,
  accountType: AccountType
) => {
  validateInput({ email });
  validateEnum({ accountType }, AccountType);
  await validateEmailNotInUse<SCHEMA>(email, accountType);
  const url = await createKeyForRegistration(email, accountType);
  const { subject, body } = genRegisterEmail(url);
  await sendEmailWithLink(email, subject, body, url);
  return { code: 200, body: 'email sent successfully' };
};

const createUser = async (
  email: string,
  full_name: string,
  phone_number: string,
  password: string,
  accountType: AccountType
) =>
  createDoc(getModelForAccountType(accountType), {
    email,
    full_name,
    phone_number,
    password,
  });

export const finishRegistration = async (
  key: string,
  full_name: string,
  phone_number: string,
  password: string,
  passwordAgain: string
) => {
  validateInput({ key });
  validateInput({ full_name });
  validateInput({ phone_number });
  validateInput({ password });
  validateInput({ passwordAgain });
  validatePasswordStrength(password);
  if (password !== passwordAgain)
    throw new InvalidInputError("Passwords don't match");
  const { email, accountType } = await validateKey<RegistrationRequest>(
    registrationRequest(),
    key
  );
  await validateEmailNotInUse(email, accountType);
  const hashedPassword = await hashPassword(password);
  const savedUser = await createUser(
    email,
    full_name,
    phone_number,
    hashedPassword,
    accountType
  );
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      generateJWT(savedUser, accountType)
    ),
  };
};
