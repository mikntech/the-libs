import { v4 } from 'uuid';
import {
  getBaseSettings,
  createDoc,
  findDocs,
  GenEmailFunction,
  InvalidInputError,
  TODO,
  UnauthorizedError,
  validateInput,
  validateEnum,
} from 'base-backend';
import { registrationRequest, Strategy, user, User } from 'auth-backend';
import { Model } from 'mongoose';
import { defaultGenRegisterEmail } from '../../services';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genRegisterControllers = <UserType>(
  strategy: Strategy<UserType>,
  UserTypeEnum: Record<string, string>,
) => {
  const {
    getModel,
    sendEmailWithLink,
    validatePasswordStrength,
    validateKey,
    hashPassword,
    generateSecureCookie,
    generateJWT,
  } = genAuthControllers(strategy);

  const validateEmailNotInUse = async (
    email: string,
    userType?: string | false,
  ) => {
    if (
      await findDocs<User, false>(getModel(userType).findOne({ email }), true)
    )
      throw new InvalidInputError(
        'An account with this email already exists. Please try to login instead.',
      );
  };

  const createKeyForRegistration = async <CB>(email: string) => {
    const key = v4();
    await createDoc(registrationRequest(), {
      email,
      key,
    });
    return `${(getBaseSettings<CB>() as TODO).clientDomains[0]}/?register-code=${key}`;
  };

  const requestToRegister = async (
    email: string,
    userType: string | false,
    genRegisterEmail: GenEmailFunction = defaultGenRegisterEmail,
  ) => {
    validateInput({ email });
    userType && validateInput({ userType });
    UserTypeEnum && validateInput({ UserTypeEnum });
    validateEnum({ userType }, UserTypeEnum);
    await validateEmailNotInUse(email, userType);
    const url = await createKeyForRegistration<UserType>(email);
    const { subject, body } = genRegisterEmail(url, userType);
    sendEmailWithLink(email, subject, body, url);
    return { code: 200, body: 'email sent successfully' };
  };

  const createUser = async (
    email: string,
    full_name: string,
    phone_number: string,
    password: string,
    model: Model<User> = user(false, false) as TODO,
  ) =>
    createDoc(model, {
      email,
      full_name,
      phone_number,
      password,
    });

  const finishRegistration = async (
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
    const doc = await validateKey(key, true);
    if (!doc?.email) throw new UnauthorizedError('wrong key');
    await validateEmailNotInUse(doc.email);
    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser(
      doc.email,
      full_name,
      phone_number,
      hashedPassword,
    );
    return {
      code: 200,
      cookie: generateSecureCookie(JWT_COOKIE_NAME, generateJWT(savedUser)),
    };
  };
  return {
    requestToRegister,
    finishRegistration,
  };
};
