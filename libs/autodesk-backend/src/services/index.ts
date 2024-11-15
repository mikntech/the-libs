import { autodeskSettings } from '../config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import type {
  DerivativesApi as DerivativesApiType,
  AuthClientTwoLegged as AuthClientTwoLeggedType,
  ObjectsApi as ObjectsApiType,
  BucketsApi as BucketsApiType,
} from 'forge-apis';
const {
  DerivativesApi,
  AuthClientTwoLegged,
  ObjectsApi,
  BucketsApi,
} = require('forge-apis');

const { autodeskClientId, autodeskClientSecret } = autodeskSettings;

export const derivativesApi: DerivativesApiType = new DerivativesApi();

export const bucketApi: BucketsApiType = new BucketsApi();

export const objectsApi: ObjectsApiType = new ObjectsApi();

export const authClient: AuthClientTwoLeggedType = new AuthClientTwoLegged(
  autodeskClientId,
  autodeskClientSecret,
  [
    'bucket:create',
    'bucket:read',
    'bucket:delete',
    'data:read',
    'data:write',
    'data:search',
    'viewables:read',
  ],
  true,
);
