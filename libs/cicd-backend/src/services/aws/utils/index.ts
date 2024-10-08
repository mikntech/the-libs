import { cicdSettings } from '../../../config';

const DONT_CARE_GLOBAL_REGION = 'us-east-1';

type ClientConstructor<T> = new (config: {
  region: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
}) => T;

export const createClient = <CC>(
  Constructor: ClientConstructor<CC>,
  region: string = cicdSettings.aws.region || DONT_CARE_GLOBAL_REGION,
) =>
  new Constructor({
    region,
    credentials: {
      accessKeyId: cicdSettings.aws.keyID,
      secretAccessKey: cicdSettings.aws.secretKey,
    },
  });
