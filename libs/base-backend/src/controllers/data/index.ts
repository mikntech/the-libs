import { Model, QueryWithHelpers } from "mongoose";
import { Document } from "base-shared";

export const findDocs = async <
  SCHEMA extends Document,
  isArray extends boolean,
  Result = SCHEMA,
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<Result> : Result | null,
    SCHEMA
  >,
  lean: boolean = true,
) => (lean ? query.lean() : query);

export const createDoc = async <SCHEMA extends Document>(
  model: Model<SCHEMA>,
  fields: {},
) =>
  new model({
    ...fields,
  }).save();
