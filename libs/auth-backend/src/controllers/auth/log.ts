import { MultiUserType, Strategy, User } from 'auth-backend';
import {
  findDocs,
  SomeEnum,
  UnauthorizedError,
  validateDocument,
  validateEnum,
  validateInput,
  TODO,
} from 'base-backend';
import { compare } from 'bcryptjs';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genLogControllers = <UserType extends SomeEnum<UserType>>(
  strategy: Strategy<UserType, boolean>,
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
    const existingUser = await findDocs<User, false>(
      getModel(userType).findOne({ email }),
      true,
    );
    if (!existingUser && !validateDocument(existingUser as unknown as User))
      throw new UnauthorizedError('Please register');
    if (existingUser && (await validateCorrectPassword(existingUser, password)))
      return generateJWT(existingUser, userType);
    throw new UnauthorizedError('Wrong password');
  };

  const logIn = async <
    UserType extends SomeEnum<UserType>,
    SCHEMA extends User = User,
  >(
    email: string,
    password: string,
    userType: UserType,
    enumValues: UserType[],
  ) => {
    validateInput({ email });
    validateInput({ password });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ enumValues });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateEnum<UserType>(userType, enumValues);
    return {
      code: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await getToken(email, password, userType as TODO),
      ),
    };
  };

  const logOut = async () => ({
    code: 200,
    cookie: generateSecureCookie(JWT_COOKIE_NAME, ''),
  });

  return {
    validateAndProtect,
    logIn,
    logOut,
  };
};
