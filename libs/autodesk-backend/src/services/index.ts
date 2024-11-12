import { autodeskSettings } from '../config';

const { DerivativesApi } = require('forge-apis');
const { AuthClientTwoLegged } = require('forge-apis');
const { autodeskClientId, autodeskClientSecret } = autodeskSettings;
export const forgeAuth = new AuthClientTwoLegged(
  autodeskClientId,
  autodeskClientSecret,
  ['data:read', 'data:write'],
  true,
);
export const derivativesApi = new DerivativesApi();
