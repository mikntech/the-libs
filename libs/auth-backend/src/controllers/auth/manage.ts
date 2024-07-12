import { sign } from 'jsonwebtoken';
import {
  createDoc,
  findDocs,
  InvalidInputError,
  validateDocument,
  validateInput,
  GenEmailFunction,
  UnauthorizedError,
  TODO,
  getBaseSettings,
} from 'base-backend';
import { Model } from 'mongoose';
import { defaultGenPassResetEmail } from '../../services';
import { v4 } from 'uuid';
import {
  passResetRequest,
  Strategy,
  user,
  User,
} from 'auth-backend';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genManageControllers = <UserType>(
  strategy: Strategy<UserType>,
) => {
  const {
    getModel,
    sendEmailWithLink,
    validatePasswordStrength,
    validateKey,
    generateSecureCookie,
    hashPassword,
  } = genAuthControllers(strategy);

  const createKeyForPassReset = async <CB extends { [s: string]: string }>(
    email: string,
  ) => {
    const key = v4();
    await createDoc(passResetRequest(), {
      email,
      key,
    });
    return `${getBaseSettings<CB>().clientDomains[0]}/?reset-code=${key}`;
  };

  const requestPasswordReset = async <SCHEMA extends User>(
    email: string,
    genPassResetEmail: GenEmailFunction = defaultGenPassResetEmail,
    model: Model<SCHEMA> = user(false, false) as TODO,
  ) => {
    validateInput({ email });
    const userDoc = await findDocs<SCHEMA, false>(
      model.findOne({ email }),
      true,
    );
    if (!userDoc || !validateDocument(userDoc as SCHEMA))
      throw new InvalidInputError('No user found with this email');
    const url = await createKeyForPassReset(email);
    const { subject, body } = genPassResetEmail(url);
    sendEmailWithLink(email, subject, body, url);
    return { code: 200, body: 'email sent successfully' };
  };

  const changeUsersPassword = async <SCHEMA extends User>(
    user: SCHEMA,
    password: string,
  ) => {
    user.password = password;
    await user.save();
    return sign(
      {
        id: user._id,
      },
      getBaseSettings().jwtSecret,
    );
  };

  const resetPassword = async <SCHEMA extends User = User>(
    key: string,
    password: string,
    passwordAgain: string,
    userType?: string,
  ) => {
    validateInput({ key });
    validateInput({ password });
    validateInput({ passwordAgain });
    if (password !== passwordAgain)
      throw new InvalidInputError("Passwords don't match");
    validatePasswordStrength(password);
    const { email } = (await validateKey(key, userType)) as unknown as {
      email: string;
    };
    const existingUser = await findDocs<SCHEMA, false>(
      getModel(userType).findOne({
        email,
      }),
    );
    if (!existingUser) throw new UnauthorizedError('what?');
    return {
      code: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await changeUsersPassword(existingUser, await hashPassword(password)),
      ),
    };
  };

  return { requestPasswordReset, resetPassword };
};
