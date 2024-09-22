import { ClientError } from '@the-libs/base-shared';

export const validateFiles = (
  req: any,
  fieldName: string,
  shouldBeArray: boolean,
) => {
  if (!(req[fieldName] && (!shouldBeArray || 'map' in req.files)))
    throw new ClientError('No file received');
};
