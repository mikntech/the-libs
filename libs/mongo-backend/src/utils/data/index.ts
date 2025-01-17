import type { QueryWithHelpers, Document as MDocument, Types } from 'mongoose';
import { ExtendedModel } from '../../db/mongo';
import { TODO } from '@the-libs/base-shared';

export interface DBDoc extends MDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Merges cached fields into documents, supporting both arrays and single documents.
 */
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

/**
 * Enhanced findDocs to support both standard queries and aggregation pipelines.
 */
export const findDocs = async <
  isArray extends boolean,
  DBDocI extends DBDoc = DBDoc,
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
  lean = true,
  withCacheValue: withCache = true as withCache,
): Promise<
  isArray extends true
    ? Array<withCache extends true ? DBDocI & ComputedPart : DBDocI>
    : (withCache extends true ? DBDocI & ComputedPart : DBDocI) | null
> =>
  lean
    ? withCacheValue
      ? await mergeCacheToDocs(await query.lean(), m)
      : query.lean()
    : query;

/**
 * New: Aggregation support with cache merging for MongoDB pipelines.
 */
export const findDocsWithAggregation = async <
  DBDocI extends MDocument = MDocument,
  ComputedPart = any,
  withCache extends boolean = true,
>(
  m: ExtendedModel<DBDocI, ComputedPart>,
  aggregationPipeline: any[],
  withCacheValue: withCache = true as withCache,
): Promise<
  withCache extends true ? Array<DBDocI & ComputedPart> : DBDocI[]
> => {
  const results = await m.model.aggregate(aggregationPipeline).exec();

  return withCacheValue ? mergeCacheToDocs(results, m) : results;
};

/**
 * Efficiently fetch a document by ID, supports caching.
 */
export const quicklyFindByID = async <
  DocType extends DBDoc,
  CP = any,
  stringable = any,
  withCache extends boolean = true,
>(
  ModelOrGetter:
    | ExtendedModel<DocType, CP>
    | (() => Promise<ExtendedModel<DocType, CP>>),
  id: string | stringable,
  lean = true,
  withCacheValue: withCache = true as withCache,
) => {
  const Model: any = (ModelOrGetter as ExtendedModel<DocType, CP>).model
    ? ModelOrGetter
    : await (ModelOrGetter as () => Promise<ExtendedModel<DocType, CP>>)();
  return findDocs<false, DocType, CP, withCache>(
    Model,
    Model.findById(String(id)),
    lean,
    withCacheValue,
  );
};

/**
 * Efficiently fetch all docs, supports caching.
 */
export const quicklyFindAll = async <
  DocType extends DBDoc,
  CP = any,
  withCache extends boolean = true,
>(
  ModelOrGetter:
    | ExtendedModel<DocType, CP>
    | (() => Promise<ExtendedModel<DocType, CP>>),
  lean = true,
  withCacheValue: withCache = true as withCache,
) => {
  const Model: any = (ModelOrGetter as ExtendedModel<DocType, CP>).model
    ? ModelOrGetter
    : await (ModelOrGetter as () => Promise<ExtendedModel<DocType, CP>>)();
  return findDocs<false, DocType, CP, withCache>(
    Model,
    Model.find({}),
    lean,
    withCacheValue,
  );
};

/**
 * Create a new document, optionally saves it to the database.
 */
export const createDoc = async <DocI extends MDocument, Computed = false>(
  { model }: ExtendedModel<DocI, Computed>,
  fields: Partial<DocI>,
  save = true,
) => {
  const doc = new model({
    ...fields,
  });
  if (save) return doc.save();
  else return doc;
};
