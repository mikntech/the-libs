import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { MultiUserType, Strategy } from '@the-libs/auth-backend';
import {
  findDocs,
  validateEnum,
  validateInput,
  validateDocument,
} from '@the-libs/mongo-backend';
import { TODO, UnauthorizedError, SomeEnum } from '@the-libs/base-shared';
const { compare } = require('bcrypt');
import { genAuthControllers, JWT_COOKIE_NAME } from './index';
import { User } from '@the-libs/auth-shared';

export const genLogControllers = <
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
  const { getModel, generateJWT, generateSecureCookie } =
    genAuthControllers(strategy);

  const protectUsersPassword = (user: User) => {
    user.password = 'secret';
    return user;
  };

  const validateCorrectPassword = async (user: User, password: string) => {
    const isPasswordCorrect = await compare(password, user.password);
    if (isPasswordCorrect) return true;
    else throw new UnauthorizedError('Wrong password');
  };

  const validateAndProtect = (user: User) => {
    if (!validateDocument(user))
      throw new UnauthorizedError(
        "Your are not logged in or your jwt couldn't parsed, please log in and try again",
      );
    return protectUsersPassword(user);
  };

  const getToken = async (
    email: string,
    password: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    validateInput({ password });
    const m = await getModel(userType);
    const existingUser = await findDocs<false, User>(m, m.findOne({ email }));
    if (!existingUser || !validateDocument(existingUser))
      throw new UnauthorizedError('Please register');
    if (await validateCorrectPassword(existingUser, password))
      return generateJWT(existingUser as TODO, userType);
    throw new UnauthorizedError('Wrong password');
  };

  const logIn = async <
    UserType extends string | number | symbol,
    SCHEMA extends User = User,
  >(
    email: string,
    password: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    validateInput({ password });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    if (
      strategy.multiUserType !== MultiUserType.SINGLE &&
      !strategy?.enumValues
    )
      throw new Error(
        "Problem with strategy ('enumValues' is falsy) while multi user is true",
      );
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateEnum<UserType>(userType, strategy.enumValues as unknown as TODO);
    return {
      statusCode: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await getToken(email, password, userType as TODO),
        String(userType),
      ),
    };
  };

  const logOut = async () => ({
    statusCode: 200,
    cookie: generateSecureCookie(JWT_COOKIE_NAME, '', 'userType', 0),
  });

  return { generateJWT, validateAndProtect, logIn, logOut };
};
