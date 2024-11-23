import type { Model, QueryWithHelpers, Document as MDocument } from 'mongoose';
import { ExtendedModel } from '../../db/mongo';

export const findDocs = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
>(
  query:
    | QueryWithHelpers<isArray extends true ? Array<DocI> : DocI | null, DocI>
    | Promise<isArray extends true ? Array<DocI> : DocI | null>,
  lean: boolean = true,
) => {
  return lean
    ? (
        query as QueryWithHelpers<
          isArray extends true ? Array<DocI> : DocI | null,
          DocI
        >
      ).lean()
    : query;
};

export const createDoc = async <DocI extends MDocument>(
  { model }: ExtendedModel<DocI>,
  fields: {},
  save: boolean = true,
) => {
  const doc = new model({
    ...fields,
  });
  if (save) return doc.save();
  else return doc;
};
