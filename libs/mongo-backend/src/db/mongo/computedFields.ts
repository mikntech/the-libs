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
) => {
  const docKey = `${String(fullDoc._id)}:${fieldName}`;
  const redisInstance = await createRedisInstance();

  // Early Return: Check if already cached to avoid recomputation
  const cachedValue = await get(
    redisInstance,
    JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
  );
  if (cachedValue !== null) {
    return JSON.parse(cachedValue);
  }

  // Circular Dependency Detection (Per Model Basis)
  if (activeComputations.has(docKey)) {
    console.error(`Circular dependency detected at key: ${docKey}`);
    throw new Error(`Circular dependency detected for: ${docKey}`);
  }

  // Track Computation Start
  activeComputations.add(docKey);
  try {
    const val = await compute(fullDoc);

    // Cache Result After Successful Computation
    await cache(
      redisInstance,
      JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
      async () => JSON.stringify(fullDoc ? val : null),
    );
    return val;
  } finally {
    // Clean Up Computation Tracking
    activeComputations.delete(docKey);
  }
};

// Modify getCached to use the new cacheField with circular detection
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

  const restoredValues = await Promise.all(
    redisKeys.map(async (redisKey) =>
      JSON.parse((await get(redisInstance, redisKey)) ?? 'null'),
    ),
  );

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
      /*.then(() => console.log(fieldName + ' on ' + myDoc._id + ' was renewed'))*/
      .then(() => extraCallBack());
};
