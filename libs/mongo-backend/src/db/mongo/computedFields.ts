import type { Types } from 'mongoose';
import { createRedisInstance, cache, get } from '@the-libs/redis-backend';
import type { ChangeStreamDocument, ChangeStreamUpdateDocument } from 'mongodb';
import { TODO } from '@the-libs/base-shared';

export type Compute<FieldType> = (_id: Types.ObjectId) => Promise<FieldType>;

type Invalidate = (
  event: ChangeStreamDocument,
  _id: Types.ObjectId,
) => Promise<boolean>;

interface FieldDefinition<FieldType> {
  compute: Compute<FieldType>;
  invalidate: Invalidate;
}

export type SchemaComputers<ComputedPartOfSchema> = {
  [Key in keyof ComputedPartOfSchema]: FieldDefinition<
    ComputedPartOfSchema[Key]
  >;
};

const cacheField = async <FieldType>(
  _id: Types.ObjectId,
  key: string,
  compute: Compute<FieldType>,
) =>
  cache(
    await createRedisInstance(),
    JSON.stringify({ _id: String(_id), key }),
    async () => JSON.stringify(await compute(_id)),
  );

export const getCached = async <ComputedPartOfSchema>(
  _id: Types.ObjectId,
  computers: SchemaComputers<ComputedPartOfSchema>,
): Promise<ComputedPartOfSchema> => {
  const redisInstance = await createRedisInstance(); // Create Redis instance once
  const keys = Object.keys(computers);
  const redisKeys = keys.map((key) =>
    JSON.stringify({ _id: String(_id), key }),
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
    missingFields.map((key) =>
      computers[key as keyof SchemaComputers<ComputedPartOfSchema>].compute(
        _id,
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

export const refreshCacheIfNeeded = async <FieldType>(
  _id: Types.ObjectId,
  fieldName: string,
  { compute, invalidate }: FieldDefinition<FieldType>,
  event: ChangeStreamUpdateDocument,
) =>
  (await invalidate(event, _id)) &&
  cacheField(_id, fieldName, compute).then(() =>
    console.log(fieldName + ' on ' + _id + ' was renewed'),
  );
