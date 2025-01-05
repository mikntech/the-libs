import { createRedisInstance, cache, get } from '@the-libs/redis-backend';
import type { Document as MDocument } from 'mongoose';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

export type Compute<FieldType, FullDoc extends MDocument> = (
  fromDoc: FullDoc,
) => Promise<FieldType>;

export type Invalidate<ChangedDoc extends MDocument> = (
  myId: string,
  collChangedDoc: string,
  fullChangedDoc: ChangedDoc,
) => Promise<boolean>;

interface FieldDefinition<
  FieldType,
  FullDoc extends MDocument,
  ChangedDoc extends MDocument,
> {
  compute: Compute<FieldType, FullDoc>;
  invalidate: Invalidate<ChangedDoc>;
}

export type SchemaComputers<
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
  ChangedDoc extends MDocument,
> = {
  [Key in keyof ComputedPartOfSchema]: FieldDefinition<
    ComputedPartOfSchema[Key],
    DBFullDoc,
    ChangedDoc
  >;
};

const activeComputations = new Set<string>();

const cacheField = async <FieldType, DBFullDoc extends MDocument>(
  fieldName: string,
  fullDoc: DBFullDoc,
  compute: Compute<FieldType, DBFullDoc>,
  forceRefresh = false, // NEW: force invalidation to recompute cache
) => {
  const docKey = `${String(fullDoc._id)}:${fieldName}`;
  const redisInstance = await createRedisInstance();

  // NEW: Prevent infinite loops
  if (activeComputations.has(docKey)) {
    /*
    console.warn(`Circular dependency avoided for: ${docKey}`);
*/
    return null; // Prevent further recursion
  }

  if (!forceRefresh) {
    const cachedValue = await get(
      redisInstance,
      JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
    );
    if (cachedValue !== null) {
      return JSON.parse(cachedValue); // Early return for non-invalidations
    }
  }

  // Mark this field as actively being computed
  activeComputations.add(docKey);
  try {
    const value = await compute(fullDoc);
    await cache(
      redisInstance,
      JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
      async () => JSON.stringify(value),
    );
    return value;
  } finally {
    activeComputations.delete(docKey);
  }
};

export const getCached = async <
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
>(
  fullDoc: DBFullDoc,
  computers: SchemaComputers<ComputedPartOfSchema, DBFullDoc, any>,
): Promise<ComputedPartOfSchema> => {
  const redisInstance = await createRedisInstance();
  const keys = Object.keys(computers);
  const redisKeys = keys.map((key) =>
    JSON.stringify({ _id: String(fullDoc._id), key }),
  );

  // Fetch existing cache
  const restoredValues = await Promise.all(
    redisKeys.map(async (redisKey) =>
      JSON.parse((await get(redisInstance, redisKey)) ?? 'null'),
    ),
  );

  // Identify which fields need recomputation
  const missingFields = keys.filter(
    (_, index) => restoredValues[index] === null,
  );

  // Prevent recursion for missing fields
  const computedValues = await Promise.all(
    missingFields.map(async (key) =>
      cacheField(
        key,
        fullDoc,
        computers[
          key as keyof SchemaComputers<ComputedPartOfSchema, DBFullDoc, any>
        ].compute,
      ),
    ),
  );

  // Merge results
  const finalValues = keys.reduce(
    (acc, key, index) => {
      acc[key] =
        restoredValues[index] !== null
          ? restoredValues[index]
          : computedValues[missingFields.indexOf(key)];
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return finalValues as ComputedPartOfSchema;
};

// Remember to use this function only with locking in watch handler
export const refreshCacheIfNeeded = async <
  FieldType,
  DBFullDoc extends MDocument,
>(
  myDoc: DBFullDoc,
  changed_Id: string,
  changedColl: string,
  fieldName: string,
  { compute, invalidate }: FieldDefinition<FieldType, DBFullDoc, any>,
  extraCallBack: () => void,
) => {
  const docKey = `${String(myDoc._id)}:${fieldName}`;

  // Prevent redundant invalidation loops
  if (activeComputations.has(docKey)) {
    console.warn(`Skipping redundant invalidation for: ${docKey}`);
    return;
  }

  const changedDoc = await mongoose.connection.db
    .collection(changedColl)
    .findOne({ _id: new mongoose.Types.ObjectId(changed_Id) });

  const shouldInvalidate = await invalidate(
    String(myDoc._id),
    changedColl,
    changedDoc,
  );

  if (shouldInvalidate) {
    activeComputations.add(docKey); // Guard against recursive invalidations
    await cacheField(fieldName, myDoc, compute, true); // Force refresh cache
    activeComputations.delete(docKey);
    extraCallBack();
  }
};
