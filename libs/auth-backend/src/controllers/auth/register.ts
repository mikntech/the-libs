import { v4 } from "uuid";
import {
  getBaseSettings,
  createDoc,
  findDocs,
  InvalidInputError,
  TODO,
  UnauthorizedError,
  validateInput,
  validateEnum,
} from "base-backend";
import { GenEmailFunction } from "email-backend";
import {
  defaultGenRegisterEmail,
  registrationRequest,
  Strategy,
} from "auth-backend";
import { genAuthControllers, JWT_COOKIE_NAME } from "./index";

export const genRegisterControllers = <UserType>(
  strategy: Strategy<UserType>,
  UserTypeEnum: Record<string, string>,
  onCreateFields: {},
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

  const validateEmailNotInUse = async (email: string, userType?: string) => {
    const x = await findDocs(getModel(userType).findOne({ email }), true);
    if (x)
      throw new InvalidInputError(
        "An account with this email already exists. Please try to login instead.",
      );
  };

  const createKeyForRegistration = async <
    CB extends { [key: string]: string } = {},
  >(
    email: string,
    userType?: string,
  ) => {
    const key = v4();
    await createDoc(registrationRequest(), {
      email,
      userType,
      key,
    });
    return `${(getBaseSettings<CB>() as TODO).clientDomains[0]}/?register-code=${key}&email=${email}`;
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
    const p = userType ? [userType] : [];
    await validateEmailNotInUse(email, ...p);
    const url = await createKeyForRegistration<any>(email, ...p);
    const { subject, body } = genRegisterEmail(url, userType);
    sendEmailWithLink(email, subject, body, url);
    return { code: 200, body: "email sent successfully" };
  };

  const createUser = async (
    email: string,
    full_name: string,
    phone_number: string,
    password: string,
    userType?: string,
  ) =>
    createDoc(getModel(userType), {
      email,
      full_name,
      phone_number,
      password,
      ...onCreateFields,
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
    if (!doc?.email) throw new UnauthorizedError("wrong key");
    await validateEmailNotInUse(doc.email, doc.userType);
    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser(
      doc.email,
      full_name,
      phone_number,
      hashedPassword,
      doc.userType,
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
