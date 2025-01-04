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
          ...(d as any),
          ...(getCached ? await getCached(d) : {}),
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
  DBDocI extends MDocument = MDocument,
  ComputedPart = any,
  withCache extends boolean = true,
>(
  m: ExtendedModel<DBDocI, ComputedPart>,
  query:
    | QueryWithHelpers<
        isArray extends true ? Array<DBDocI> : DBDocI | null,
        DBDocI
      >
    | TODO,
  lean: boolean = true,
  withCacheValue: withCache = true as withCache,
): Promise<
  isArray extends true
    ? Array<withCache extends true ? DBDocI | ComputedPart : DBDocI>
    : (withCache extends true ? DBDocI | ComputedPart : DBDocI) | null
> =>
  lean
    ? withCacheValue
      ? await mergeCacheToDocs(await query.lean(), m)
      : query.lean()
    : query;

export const quicklyFindByID = async <
  DocType extends MDocument<any, any, any>,
  CP = any,
  stringable = any,
>(
  ModelOrGetter:
    | ExtendedModel<DocType, CP>
    | (() => Promise<ExtendedModel<DocType, CP>>),
  id: string | stringable,
) => {
  const Model: any = (ModelOrGetter as ExtendedModel<DocType, CP>).model
    ? ModelOrGetter
    : await (ModelOrGetter as () => Promise<ExtendedModel<DocType, CP>>)();
  return findDocs<false, DocType, CP>(Model, Model.findById(String(id)));
};

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
