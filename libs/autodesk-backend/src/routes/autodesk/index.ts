import { getAutodeskToken } from '../../controllers/autodesk';
import { highOrderHandler, TODO } from 'base-backend';
import { Router } from 'express';
import axios from 'axios';
import { stringify } from 'qs';

export const autodeskRouter = Router();

autodeskRouter.get(
  '/getToken',
  highOrderHandler((async () => {
    try {
      const credentials = await getAutodeskToken();
      if (credentials) {
        const response = await axios.post(
          credentials.Authentication ?? '',
          stringify(credentials.credentials),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
        return { statusCode: 200, body: { access_token: response.data } };
      }
    } catch (error) {
      throw new Error('Failed to authenticate with Autodesk');
    }
    return null;
  }) as TODO),
);
