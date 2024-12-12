import {
  genAuthControllers,
  JWT_COOKIE_NAME,
  Strategy,
  verifyGoogleUser,
} from '@the-libs/auth-backend';
import { findDocs } from '@the-libs/mongo-backend';
import { TODO } from '@the-libs/base-shared';
import { genLogControllers } from '../log';
import { User } from '@the-libs/auth-shared';

export const genGoogleControllers = <
  UserType extends string | number | symbol,
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
  const { generateJWT } = genLogControllers(strategy);
  const { getModel, generateSecureCookie } = genAuthControllers(strategy);
  const google = async (token: any, userType: UserType) => {
    const email = await verifyGoogleUser(token);
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
          String(userType),
        ),
      };
    return {
      statusCode: 401,
      body: 'Please register or fin',
    };
  };

  return { google };
};
