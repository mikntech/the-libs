import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Model, QueryWithHelpers } = require('mongoose');

import type { Types, Document as MDocument } from 'mongoose';

export const findDocs = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<DocI> : DocI | null,
    DocI
  >,
  lean: boolean = true,
) => (lean ? query.lean() : query);

export const createDoc = async <DocI extends MDocument>(
  model: Model<DocI>,
  fields: {},
) =>
  new model({
    ...fields,
  }).save();
