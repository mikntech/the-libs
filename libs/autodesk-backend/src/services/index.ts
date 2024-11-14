import { autodeskSettings } from '../config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { DerivativesApi, AuthClientTwoLegged } = require('forge-apis');
const { autodeskClientId, autodeskClientSecret } = autodeskSettings;
export const forgeAuth = new AuthClientTwoLegged(
  autodeskClientId,
  autodeskClientSecret,
  ['data:read', 'data:write'],
  true,
);
export const derivativesApi = new DerivativesApi();
