import axios from 'axios';
import { autodeskSettings } from '../../config';

export const getForgeToken = async (code: string, redirectUri: string) => {
  try {
    const response = await axios.post(
      'https://developer.api.autodesk.com/authentication/v2/authorize',
      {
        client_id: autodeskSettings.AUTODESK_CLIENT_ID,
        client_secret: autodeskSettings.AUTODESK_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
  }
};
