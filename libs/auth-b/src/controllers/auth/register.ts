import { v4 } from 'uuid';
import {
  createDoc,
  InvalidInputError,
  validateEnum,
  validateInput,
  GenEmailFunction,
  findDocs,
} from 'gbase-b';
import settings from '../../../../gbase-b/src/config';
import {RegistrationRequest, User} from 'auth-b';
import registrationRequest from '../../schemas/auth/registrationRequest';
import { Model } from 'mongoose';
import user from '../../schemas/auth/user';
import { defaultGenRegisterEmail } from '../../services';
import {
  generateJWT,
  generateSecureCookie,
  hashPassword,
  JWT_COOKIE_NAME, sendEmailWithLink,
  validateKey,
  validatePasswordStrength
} from "./index";

const validateEmailNotInUse = async <SCHEMA extends User = User>(
  email: string,
  model: Model<SCHEMA> = user(),
) => {
  if (await findDocs<SCHEMA, false>(model.findOne({ email }), true))
    throw new InvalidInputError(
      'An account with this email already exists. Please try to login instead.',
    );
};

const createKeyForRegistration = async <SCHEMA extends User = User>(
  email: string,
  model: Model<SCHEMA> = user(),
) => {
  const key = v4();
  await createDoc(model, {
    email,
    key,
  });
  return `${settings.clientDomain}/?register-code=${key}`;
};

export const requestToRegister = async <
  SCHEMA extends User = User,
  AccountTypeEnum = never,
>(
  email: string,
  genRegisterEmail: GenEmailFunction = defaultGenRegisterEmail,
  accountType?: AccountTypeEnum,
  accountTypeEnum?: {
    [key: string]: string;
  },
) => {
  validateInput({ email });
  accountType && validateEnum({ accountType }, accountTypeEnum);
  await validateEmailNotInUse<SCHEMA>(email);
  const url = await createKeyForRegistration(email, accountType);
  const { subject, body } = genRegisterEmail(url);
  sendEmailWithLink(email, subject, body, url);
  return { code: 200, body: 'email sent successfully' };
};

const createUser = async<SCHEMA extends User=User> (
  email: string,
  full_name: string,
  phone_number: string,
  password: string,
model:Model<SCHEMA>=user()) =>
  createDoc((model), {
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
  passwordAgain: string,
) => {
  validateInput({ key });
  validateInput({ full_name });
  validateInput({ phone_number });
  validateInput({ password });
  validateInput({ passwordAgain });
  validatePasswordStrength(password);
  if (password !== passwordAgain)
    throw new InvalidInputError("Passwords don't match");
  const { email } = await validateKey<RegistrationRequest>(
    registrationRequest(),
    key,
  );
  await validateEmailNotInUse(email);
  const hashedPassword = await hashPassword(password);
  const savedUser = await createUser(
    email,
    full_name,
    phone_number,
    hashedPassword,
    accountType,
  );
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      generateJWT(savedUser, accountType),
    ),
  };
};
