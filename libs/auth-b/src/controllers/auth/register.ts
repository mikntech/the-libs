import { v4 } from 'uuid';
import {
  createDoc,
  findDocs,
  InvalidInputError,
  validateEnum,
  validateInput,
} from 'gbase-b';
import settings from '../../../../gbase-b/src/config';
import { User } from 'auth-b';
import registrationRequest from '../../schemas/auth/registrationRequest';

const validateEmailNotInUse = async <SCHEMA extends User>(
  email: string,
  accountType: AccountType,
) => {
  const userModel = getModelForAccountType<SCHEMA>(accountType);
  const existingUser = await findDocs<SCHEMA, false>(
    userModel.findOne({ email }),
    true,
  );
  if (existingUser)
    throw new InvalidInputError(
      'An account with this email already exists. Please try to login instead.',
    );
};

const createKeyForRegistration = async (
  email: string,
  accountType: AccountType,
) => {
  const key = v4();
  await createDoc(registrationRequest(), {
    email,
    accountType,
    key,
  });
  return `${settings.clientDomain}/?register-code=${key}`;
};

export const requestToRegister = async <
  SCHEMA extends User = User,
  AccountTypeEnum = never,
>(
  email: string,
  accountType?: AccountTypeEnum,
) => {
  validateInput({ email });
  accountType && validateEnum({ accountType }, AccountTypeEnum);
  await validateEmailNotInUse<SCHEMA>(email, accountType);
  const url = await createKeyForRegistration(email, accountType);
  const { subject, body } = genRegisterEmail(url);
  sendEmailWithLink(email, subject, body, url);
  return { code: 200, body: 'email sent successfully' };
};

const createUser = async (
  email: string,
  full_name: string,
  phone_number: string,
  password: string,
  accountType: AccountType,
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
  const { email, accountType } = await validateKey<RegistrationRequest>(
    registrationRequest(),
    key,
  );
  await validateEmailNotInUse(email, accountType);
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
