import type { QueryWithHelpers, Document as MDocument, Types } from 'mongoose';
import { ExtendedModel } from '../../db/mongo';
import { TODO } from '@the-libs/base-shared';

export const mergeCacheToDocs = async <
  DocI extends MDocument & { _id: Types.ObjectId } = MDocument & {
    _id: Types.ObjectId;
  },
  ComputedPart = any,
>(
  doc: DocI | DocI[],
  { getCached }: ExtendedModel<DocI, ComputedPart>,
) =>
  Array.isArray(doc)
    ? Promise.all(
        doc.map(async (d) => ({
          ...d,
          ...(getCached ? await (getCached as Function)(d)(d._id) : {}),
        })),
      )
    : doc === null
      ? null
      : {
          ...doc,
          ...(getCached ? await getCached(doc) : {}),
        };

export const findDocs = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
  ComputedPart = any,
>(
  m: ExtendedModel<DocI, ComputedPart>,
  query:
    | QueryWithHelpers<isArray extends true ? Array<DocI> : DocI | null, DocI>
    | TODO,
  lean: boolean = true,
  withCache: boolean = true,
): Promise<isArray extends true ? Array<DocI> : DocI | null> =>
  lean
    ? withCache
      ? await mergeCacheToDocs(await query.lean(), m)
      : query.lean()
    : query;

export const createDoc = async <DocI extends MDocument, Computed = false>(
  { model }: ExtendedModel<DocI, Computed>,
  fields: Partial<DocI>,
  save: boolean = true,
) => {
  const doc = new model({
    ...fields,
  });
  if (save) return doc.save();
  else return doc;
};
