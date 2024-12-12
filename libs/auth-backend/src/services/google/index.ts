import { authSettings } from '../../config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();
export const verifyGoogleUser = async (token: any) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: authSettings.googleClientId, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return payload['sub'];
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];
};
