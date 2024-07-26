import { autodeskSettings } from '../../config';

interface Credentials {
  credentials: {
    client_id: any;
    client_secret: any;
    grant_type: string;
    scope: string;
  };
  BaseUrl: string;
  Version: string;
  Authentication?: string;
}

export const getAutodeskToken = async () => {
  try {
    const credentials: Credentials = {
      credentials: {
        client_id: autodeskSettings.AUTODESK_CLIENT_ID,
        client_secret: autodeskSettings.AUTODESK_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'data:read',
      },
      // Autodesk Forge base url
      BaseUrl: 'https://developer.api.autodesk.com',
      Version: 'v2',
    };
    credentials.Authentication = `${credentials.BaseUrl}/authentication/${credentials.Version}/token`;
    return credentials;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};
