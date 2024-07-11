import { User, user } from 'auth-backend';
import { Model } from 'mongoose';
import {
  findDocs,
  TODO,
  UnauthorizedError,
  validateDocument,
  validateEnum,
  validateInput,
} from 'base-backend';
import { generateJWT, generateSecureCookie, JWT_COOKIE_NAME } from './index';
import { compare } from 'bcryptjs';

const protectUsersPassword = (user: User) => {
  user.password = 'secret';
  return user;
};

const validateCorrectPassword = async (user: User, password: string) => {
  const isPasswordCorrect = await compare(password, user.password);
  if (isPasswordCorrect) return true;
  else throw new UnauthorizedError('Wrong password');
};

export const validateAndProtect = (user: User) => {
  if (!validateDocument(user))
    throw new UnauthorizedError(
      "Your are not logged in or your jwt couldn't parsed, please log in and try again",
    );
  return protectUsersPassword(user);
};

export const getToken = async <
  SCHEMA extends User = User,
  AccountTypeEnum = never,
>(
  email: string,
  password: string,
  model: Model<SCHEMA> = user(false, false) as TODO,
  accountType?: AccountTypeEnum,
) => {
  validateInput({ email });
  validateInput({ password });
  const existingUser = await findDocs<SCHEMA, false>(
    model.findOne({ email }),
    true,
  );
  if (!existingUser && !validateDocument(existingUser as unknown as SCHEMA))
    throw new UnauthorizedError('Please register');
  const accountTypeParam: [AccountTypeEnum?] = accountType
    ? [accountType as AccountTypeEnum]
    : [];
  if (existingUser && (await validateCorrectPassword(existingUser, password)))
    return generateJWT<SCHEMA, AccountTypeEnum>(
      existingUser as SCHEMA,
      ...accountTypeParam,
    );
  throw new UnauthorizedError('Wrong password');
};

export const logIn = async <
  SCHEMA extends User = User,
  AccountTypeEnum = never,
>(
  email: string,
  password: string,
  model: Model<SCHEMA> = user(false, false) as TODO,
  accountType?: AccountTypeEnum,
  accountTypeEnum?: { [key: string]: string },
) => {
  validateInput({ email });
  debugger;
  validateInput({ password });
  accountType && validateInput({ accountType });
  accountType &&
    accountTypeEnum &&
    validateEnum({ accountType }, accountTypeEnum);
  return {
    code: 200,
    cookie: generateSecureCookie(
      JWT_COOKIE_NAME,
      await getToken(email, password, model, accountType),
    ),
  };
};

export const logOut = async () => ({
  code: 200,
  cookie: generateSecureCookie(JWT_COOKIE_NAME, ''),
});
