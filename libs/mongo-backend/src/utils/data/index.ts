import type { QueryWithHelpers, Document as MDocument } from 'mongoose';
import { ExtendedModel } from '../../db/mongo';
import { TODO } from '@the-libs/base-shared';

export const findDocs = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
>(
  query:
    | QueryWithHelpers<isArray extends true ? Array<DocI> : DocI | null, DocI>
    | TODO,
  lean: boolean = true,
): Promise<isArray extends true ? Array<DocI> : DocI | null> =>
  lean ? query.lean() : query;

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
