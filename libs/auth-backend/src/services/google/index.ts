import { createRequire } from 'module';
import { MultiClientType, Strategy } from '../../strategy';
import { authSettings } from '../../config';

const require = createRequire(import.meta.url);
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();
export const verifyGoogleUser = async <
  UserType extends string | number | symbol,
  RequiredFields extends object,
  OptionalFields extends object,
>(
  token: any,
  strategy?: Strategy<
    RequiredFields,
    OptionalFields,
    UserType,
    boolean,
    boolean
  >,
) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      strategy?.multiClientType === MultiClientType.SINGLE
        ? authSettings.googleClientId
        : authSettings.googleClientIds,
  });
  const payload = ticket.getPayload();
  return payload.email_verified && payload.email;
};
