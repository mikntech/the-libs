import type { Types } from 'mongoose';
import { createRedisInstance, cache, get } from '@the-libs/redis-backend';
import type { ChangeStreamDocument } from 'mongodb';
import type { Document as MDocument } from 'mongoose';

export type Compute<FieldType, FullDoc extends MDocument> = (
  _id: Types.ObjectId | string,
  fullDoc: FullDoc,
) => Promise<FieldType>;

type Invalidate = (
  event: ChangeStreamDocument,
  _id: Types.ObjectId,
) => Promise<boolean>;

interface FieldDefinition<FieldType, FullDoc extends MDocument> {
  compute: Compute<FieldType, FullDoc>;
  invalidate: Invalidate;
}

export type SchemaComputers<
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
> = {
  [Key in keyof ComputedPartOfSchema]: FieldDefinition<
    ComputedPartOfSchema[Key],
    DBFullDoc
  >;
};

const cacheField = async <FieldType, DBFullDoc extends MDocument>(
  _id: Types.ObjectId,
  fullDoc: DBFullDoc | undefined,
  key: string,
  compute: Compute<FieldType, DBFullDoc>,
) => {
  console.log('String(_id): ', String(_id));
  cache(
    await createRedisInstance(),
    JSON.stringify({ _id: String(_id), key }),
    async () => JSON.stringify(fullDoc ? await compute(_id, fullDoc) : null),
  );
};

export const getCached = async <
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
>(
  _id: Types.ObjectId | string,
  computers: SchemaComputers<ComputedPartOfSchema, DBFullDoc>,
  fullDoc: DBFullDoc,
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
      computers[
        key as keyof SchemaComputers<ComputedPartOfSchema, DBFullDoc>
      ].compute(_id, fullDoc),
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
  _id: Types.ObjectId,
  dbFullDoc: DBFullDoc | undefined,
  fieldName: string,
  { compute, invalidate }: FieldDefinition<FieldType, DBFullDoc>,
  event: ChangeStreamDocument,
  extraCallBack: () => void,
) =>
  (await invalidate(event, _id)) &&
  cacheField(_id, dbFullDoc, fieldName, compute)
    .then(() => console.log(fieldName + ' on ' + _id + ' was renewed'))
    .then(() => extraCallBack());
