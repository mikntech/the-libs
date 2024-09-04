import {
  createDoc,
  findDocs,
  validateDocument,
  validateEnum,
  validateInput,
} from '@the-libs/base-backend';
import {
  UnauthorizedError,
  InvalidInputError,
  SomeEnum,
  TODO,
} from '@the-libs/base-shared';
import { v4 } from 'uuid';
import {
  MultiUserType,
  passResetRequest,
  Strategy,
} from '@the-libs/auth-backend';
import { User } from '@the-libs/auth-shared';

import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genManageControllers = <
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
    generateSecureCookie,
    hashPassword,
    generateURLWithParams,
    generateJWT,
  } = genAuthControllers(strategy);

  const createKeyForPassReset = async <CB extends { [s: string]: string }>(
    email: string,
    userType: UserType,
  ) => {
    const key = v4();
    await createDoc(passResetRequest(), {
      email,
      key,
    });
    return generateURLWithParams(
      `reset-code=${key}&email=${email}`,
      userType as unknown as string,
    );
  };

  const requestPasswordReset = async <SCHEMA extends User>(
    email: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    const userDoc = await findDocs<false, SCHEMA>(
      getModel(userType).findOne({ email }),
    );
    if (!userDoc || !validateDocument(userDoc as SCHEMA))
      throw new InvalidInputError('No user found with this email');
    const url = await createKeyForPassReset(email, (userDoc as TODO).userType);
    const { subject, body } = strategy.genPassResetEmail(url);
    sendEmailWithLink(email, subject, body, url);
    return { statusCode: 200, body: 'email sent successfully' };
  };

  const changeUsersPassword = async (
    user: User<boolean, boolean>,
    password: string,
  ) => {
    user.password = password;
    await user.save();
    return generateJWT(user, (user as TODO).userType);
  };

  const changeUsersFullName = async (
    user: User | null,
    newFullName: string,
  ) => {
    if (!user?.save)
      throw new Error('a lean doc was passed to changeUsersFullName');
    user.full_name = newFullName;
    await user.save();
  };

  const changeUsersPhone = async (user: TODO, phone: string) => {
    if (!user?.save)
      throw new Error('a lean doc was passed to changeUsersPhone');
    user.phone = phone;
    await user.save();
  };

  const resetPassword = async (
    key: string,
    password: string,
    passwordAgain: string,
    userType: UserType,
  ) => {
    validateInput({ key });
    validateInput({ password });
    validateInput({ passwordAgain });
    strategy.multiUserType === MultiUserType.MULTI_COLLECTION &&
      validateInput({ userType });
    strategy.multiUserType === MultiUserType.MULTI_COLLECTION &&
      validateEnum(userType, strategy.enumValues as UserType[]);
    if (password !== passwordAgain)
      throw new InvalidInputError("Passwords don't match");
    validatePasswordStrength(password);
    const { email } = (await validateKey(key, false)) as unknown as {
      email: string;
    };
    const existingUser = await findDocs<
      false,
      User<false, false, true, UserType>
    >(
      getModel(userType).findOne({
        email,
      }) as unknown as TODO,
      false,
    );
    if (!existingUser) throw new UnauthorizedError('what?');
    return {
      statusCode: 200,
      body: 'Password changed successfully. use your new password from now and you are logged in.',
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await changeUsersPassword(
          existingUser as TODO,
          await hashPassword(password),
        ),
      ),
    };
  };

  const updateFullName = async (
    user: User | null,
    userType: UserType,
    newFullName: string,
  ) => {
    if (!user) throw new UnauthorizedError('you are not logged in');

    validateInput({ newFullName });

    const userDoc = (await findDocs(
      getModel(userType).findById(user._id),
      false,
    )) as unknown as User | null;


    await changeUsersFullName(userDoc, newFullName);
    return { statusCode: 201 };
  };



  const updatePhone = async (
    user: User | null,
    userType: UserType,
    phone: string,
  ) => {
    if (!user) throw new UnauthorizedError('you are not logged in');
    validateInput({ phone });

    const userDoc = (await findDocs(
      getModel(userType).findById(user._id),
      false,
    )) as unknown as User | null;

    await changeUsersPhone(userDoc, phone);
    return { statusCode: 201, body: 'Phone updated successfully' };
  };

  return { requestPasswordReset, resetPassword, updateFullName, updatePhone };
};
