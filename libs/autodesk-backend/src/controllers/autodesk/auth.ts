import { authClient } from '../../services';

export const getToken = async () =>
  authClient.getCredentials().access_token
    ? authClient.getCredentials()
    : await authClient.authenticate();
