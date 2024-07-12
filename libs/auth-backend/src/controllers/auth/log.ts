import { MultiUserType, Strategy, User } from 'auth-backend';
import {
  findDocs,
  UnauthorizedError,
  validateDocument,
  validateEnum,
  validateInput,
} from 'base-backend';
import { compare } from 'bcryptjs';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genLogControllers = <UserType>(strategy: Strategy<UserType>) => {
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
    userType?: string,
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

  const logIn = async <UserType, SCHEMA extends User = User>(
    email: string,
    password: string,
    userType?: string,
    UserTypeEnum?: Record<string, string>,
  ) => {
    validateInput({ email });
    validateInput({ password });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ UserTypeEnum });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateEnum({ userType }, UserTypeEnum as Record<string, string>);
    return {
      code: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await getToken(email, password, userType),
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
