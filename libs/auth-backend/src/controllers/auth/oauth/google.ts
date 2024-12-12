import { Strategy, verifyGoogleUser } from '@the-libs/auth-backend';

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
  const google = async (token: any, userType: UserType) => {
    const result = await verifyGoogleUser(token);
    console.log(result);
    return { statusCode: 199, body: 'null' };
  };

  return { google };
};
