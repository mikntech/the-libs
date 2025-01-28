import {
  genAuthControllers,
  genRegisterControllers,
  JWT_COOKIE_NAME,
  Strategy,
  verifyGoogleUser,
} from '../../..';
import { findDocs } from '@the-libs/mongo-backend';
import { TODO } from '@the-libs/base-shared';
import { genLogControllers } from '../log';
import { User } from '@the-libs/auth-shared';

export const genGoogleControllers = <
  UserType extends string | number | symbol,
  RequiredFields extends object,
  OptionalFields extends object,
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserType,
    boolean,
    boolean
  >,
) => {
  const { generateJWT } = genLogControllers(strategy);
  const { getModel, generateSecureCookie } = genAuthControllers(strategy);
  const { registerWithExternalProvider } = genRegisterControllers(strategy);
  const useGoogle = async (token: any, userType?: UserType) => {
    const email = await verifyGoogleUser(token, strategy);
    const model = await getModel(userType);
    const maybeUser = await findDocs<false, User>(
      model,
      model.findOne({ email }),
    );
    if (maybeUser)
      return {
        statusCode: 200,
        cookie: generateSecureCookie(
          JWT_COOKIE_NAME,
          generateJWT(maybeUser, userType as TODO),
        ),
      };
    return registerWithExternalProvider(email, userType);
  };

  return { useGoogle };
};
