import { v4 } from 'uuid';
import {
  createDoc,
  findDocs,
  validateInput,
  validateEnum,
} from '@the-libs/mongo-backend';
import {
  SomeEnum,
  InvalidInputError,
  UnauthorizedError,
  TODO,
} from '@the-libs/base-shared';
import { GenEmailFunction } from '@the-libs/email-backend';
import {
  defaultGenRegisterEmail,
  MultiUserType,
  registrationRequest,
  Strategy,
} from '@the-libs/auth-backend';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genRegisterControllers = <
  UserType extends SomeEnum<UserType>,
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
  const {
    getModel,
    sendEmailWithLink,
    validatePasswordStrength,
    validateKey,
    hashPassword,
    generateSecureCookie,
    generateJWT,
    generateURLWithParams,
  } = genAuthControllers(strategy);

  const validateEmailNotInUse = async (email: string, userType: UserType) => {
    if (await findDocs(getModel(userType).findOne({ email }), true))
      throw new InvalidInputError(
        'An account with this email already exists. Please try to login instead.',
      );
  };

  const createKeyForRegistration = async (email: string, userType: string) => {
    const key = v4();
    await createDoc(registrationRequest(), {
      email,
      userType: userType as unknown as UserType,
      key,
    });
    return generateURLWithParams(
      `register-code=${key}&email=${email}`,
      userType,
    );
  };

  const requestToRegister = async (
    email: string,
    userType: UserType,
    genRegisterEmail: GenEmailFunction = defaultGenRegisterEmail,
  ) => {
    validateInput({ email });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateEnum<UserType>(userType, strategy.enumValues as UserType[]);
    await validateEmailNotInUse(email, userType);
    const url = await createKeyForRegistration(
      email,
      userType as unknown as string,
    );
    const { subject, body } = genRegisterEmail(url, userType);
    sendEmailWithLink(email, subject, body, url);
    return { statusCode: 200, body: 'email sent successfully' };
  };

  const createUser = async (
    email: string,
    full_name: string,
    password: string,
    userType: UserType,
    requiredFields: RequiredFields,
  ) =>
    createDoc(getModel(userType), {
      email,
      full_name,
      userType,
      password,
      ...requiredFields,
      ...(strategy.onCreateFields || {}),
    });

  const finishRegistration = async (
    key: string,
    full_name: string,
    password: string,
    passwordAgain: string,
    requiredFields: RequiredFields,
    optionalFields: OptionalFields,
  ) => {
    validateInput({ key });
    validateInput({ full_name });
    validateInput({ password });
    validateInput({ passwordAgain });
    strategy.requiredFields.forEach((key) =>
      validateInput(
        { [key]: requiredFields?.[key as keyof RequiredFields] },
        'requiredFields',
      ),
    );
    validatePasswordStrength(password);
    if (password !== passwordAgain)
      throw new InvalidInputError("Passwords don't match");
    const doc = await validateKey(key, true);
    if (!doc?.email) throw new UnauthorizedError('wrong key');
    await validateEmailNotInUse(doc.email, doc.userType as unknown as UserType);
    const hashedPassword = await hashPassword(password);
    const savedUser = await createUser(
      doc.email,
      full_name,
      hashedPassword,
      doc.userType as unknown as UserType,
      requiredFields,
    );
    strategy.postRegistrationCB &&
      strategy.postRegistrationCB(
        savedUser,
        (optionalFields as TODO).business_hp_id,
      );
    return {
      statusCode: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        generateJWT(savedUser, doc.userType as unknown as UserType),
      ),
    };
  };
  return {
    requestToRegister,
    finishRegistration,
  };
};
