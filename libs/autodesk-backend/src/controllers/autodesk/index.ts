import { derivativesApi, forgeAuth } from '../../services';

export const getAutodeskToken = async () =>
  (await forgeAuth.authenticate()).access_token;

export const translate = async (fileUrn: string) => {
  const urn = Buffer.from(fileUrn).toString('base64'); // Forge requires base64 encoding
  await derivativesApi.translate(
    {
      input: { urn },
      output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] },
    },
    forgeAuth,
    forgeAuth.getCredentials(),
  );
  return { statusCode: 201, body: 'Translation started' };
};
