import { getModel } from '@the-libs/mongo-backend';

export const getModelTOSQL = (params: Parameters<typeof getModel>) => {
  const [name, schema, o] = params;
};
