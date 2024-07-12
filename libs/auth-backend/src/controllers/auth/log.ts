import { Strategy, User, user } from 'auth-backend';
import { Model } from 'mongoose';
import {
  findDocs,
  TODO,
  UnauthorizedError,
  validateDocument,
  validateEnum,
  validateInput,
} from 'base-backend';
import { compare } from 'bcryptjs';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genLogControllers = <UserType>(strategy: Strategy<UserType>) => {
  const { generateJWT, generateSecureCookie } = genAuthControllers(strategy);

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

  const getToken = async <
    SCHEMA extends User = User,
    MultiUserTypeEnum = never,
  >(
    email: string,
    password: string,
    model: Model<SCHEMA> = user(false, false) as TODO,
    MultiUserType?: MultiUserTypeEnum,
  ) => {
    validateInput({ email });
    validateInput({ password });
    const existingUser = await findDocs<SCHEMA, false>(
      model.findOne({ email }),
      true,
    );
    if (!existingUser && !validateDocument(existingUser as unknown as SCHEMA))
      throw new UnauthorizedError('Please register');
    const MultiUserTypeParam: [MultiUserTypeEnum?] = MultiUserType
      ? [MultiUserType]
      : [];
    if (existingUser && (await validateCorrectPassword(existingUser, password)))
      return generateJWT<SCHEMA>(
        existingUser as SCHEMA,
        ...(MultiUserTypeParam as any),
      );
    throw new UnauthorizedError('Wrong password');
  };

  const logIn = async <SCHEMA extends User = User, MultiUserTypeEnum = never>(
    email: string,
    password: string,
    model: Model<SCHEMA> = user(false, false) as TODO,
    MultiUserType?: MultiUserTypeEnum,
    MultiUserTypeEnum?: { [key: string]: string },
  ) => {
    validateInput({ email });
    debugger;
    validateInput({ password });
    MultiUserType && validateInput({ MultiUserType });
    MultiUserType &&
      MultiUserTypeEnum &&
      validateEnum({ MultiUserType }, MultiUserTypeEnum);
    return {
      code: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await getToken(email, password, model, MultiUserType),
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
