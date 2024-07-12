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
  getModel,
} from 'base-backend';
import {
  registrationRequest,
  RegistrationRequest,
  Strategy,
  user,
  User,
} from 'auth-backend';
import { Model } from 'mongoose';
import { defaultGenRegisterEmail } from '../../services';
import {
  generateJWT,
  generateSecureCookie,
  hashPassword,
  JWT_COOKIE_NAME,
  sendEmailWithLink,
  validateKey,
  validatePasswordStrength,
} from './index';

export const genRegisterControllers = <UserType>(
  strategy: Strategy<UserType>,
) => {
  const validateEmailNotInUse = async <SCHEMA extends User = User>(
    email: string,
    userType?: string,
  ) => {
    if (await findDocs<SCHEMA, false>(getModel(Sta).findOne({ email }), true))
      throw new InvalidInputError(
        'An account with this email already exists. Please try to login instead.',
      );
  };

  const createKeyForRegistration = async <
    CB extends { [s: string]: string },
    SCHEMA extends User = User,
  >(
    email: string,
    model: Model<SCHEMA> = user(false, false) as TODO,
  ) => {
    const key = v4();
    await createDoc(model, {
      email,
      key,
    });
    return `${getBaseSettings<CB>().clientDomains[0]}/?register-code=${key}`;
  };

  const requestToRegister = async <
    SCHEMA extends User = User,
    MultiUserTypeEnum = never,
  >(
    email: string,
    genRegisterEmail: GenEmailFunction = defaultGenRegisterEmail,
    MultiUserType?: MultiUserTypeEnum,
    MultiUserTypeEnum?: {
      [key: string]: string;
    },
  ) => {
    validateInput({ email });
    MultiUserType && validateEnum({ MultiUserType }, MultiUserTypeEnum);
    await validateEmailNotInUse<SCHEMA>(email, MultiUserType);
    const url = await createKeyForRegistration(email);
    const { subject, body } = genRegisterEmail(url, MultiUserType);
    sendEmailWithLink(email, subject, body, url);
    return { code: 200, body: 'email sent successfully' };
  };

  const createUser = async <SCHEMA extends User = User>(
    email: string,
    full_name: string,
    phone_number: string,
    password: string,
    model: Model<SCHEMA> = user(false, false) as TODO,
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
    const doc = await validateKey<RegistrationRequest>(
      registrationRequest(),
      key,
    );
    if (!doc?.email) throw new UnauthorizedError('wrong key');
    await validateEmailNotInUse(doc?.email);
    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser(
      doc?.email,
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
