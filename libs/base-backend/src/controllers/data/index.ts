import {
  Model,
  QueryWithHelpers,
  Types,
  Document as MDocument,
} from 'mongoose';

export const findDocs = async <
  isArray extends boolean,
  SCHEMA extends MDocument<Types.ObjectId> = MDocument<Types.ObjectId>,
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<SCHEMA> : SCHEMA | null,
    SCHEMA
  >,
  lean: boolean = true,
) => (lean ? query.lean() : query);

export const createDoc = async <SCHEMA extends MDocument<Types.ObjectId>>(
  model: Model<SCHEMA>,
  fields: {},
) =>
  new model({
    ...fields,
  }).save();
