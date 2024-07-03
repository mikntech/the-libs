import { Model, QueryWithHelpers } from 'mongoose';
import { Document } from '../../types';

export const findDocs = async <
  SCHEMA,
  isArray extends boolean,
  Result = SCHEMA
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<Result> : Result,
    SCHEMA
  >,
  lean: boolean = true
) => (lean ? query.lean() : query);

export const createDoc = async <SCHEMA extends Document>(
  model: Model<SCHEMA>,
  fields: {}
) =>
  new model({
    ...fields,
  }).save();
