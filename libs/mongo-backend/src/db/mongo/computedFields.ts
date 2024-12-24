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

const cacheField = async <FieldType, DBFullDoc extends MDocument>(
  fieldName: string,
  fullDoc: DBFullDoc,
  compute: Compute<FieldType, DBFullDoc>,
) => {
  const val = await compute(fullDoc);
  await cache(
    await createRedisInstance(),
    JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
    async () => JSON.stringify(fullDoc ? val : null),
  );
  return val;
};

export const getCached = async <
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
>(
  fullDoc: DBFullDoc,
  computers: SchemaComputers<ComputedPartOfSchema, DBFullDoc, any>,
): Promise<ComputedPartOfSchema> => {
  const redisInstance = await createRedisInstance(); // Create Redis instance once
  const keys = Object.keys(computers);
  const redisKeys = keys.map((key) =>
    JSON.stringify({ _id: String(fullDoc._id), key }),
  );

  // Batch Redis GET operations
  const restoredValues = await Promise.all(
    redisKeys.map(async (redisKey) =>
      JSON.parse((await get(redisInstance, redisKey)) ?? 'null'),
    ),
  );

  // Compute missing fields in parallel
  const missingFields = keys.filter(
    (_, index) => restoredValues[index] === null,
  );
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

  // Merge restored and computed values
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
  const changedDcc = await mongoose.connection.db
    .collection(changedColl)
    .findOne({ _id: new mongoose.Types.ObjectId(changed_Id) });
  (await invalidate(String(myDoc._id), changedColl, changedDcc)) &&
    cacheField(fieldName, myDoc, compute)
      .then(() => console.log(fieldName + ' on ' + changed_Id + ' was renewed'))
      .then(() => extraCallBack());
};
