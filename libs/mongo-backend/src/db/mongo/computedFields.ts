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
  const restoredValues = await Promise.all(
    await Promise.all(
      Object.keys(computers).map(async (key) =>
        JSON.parse(
          (await get(
            await createRedisInstance(),
            JSON.stringify({ _id: String(_id), key }),
          )) ?? 'null',
        ),
      ),
    ),
  );
  const validValues = await Promise.all(
    restoredValues.map(
      async (field, index) =>
        field ??
        (await computers[
          Object.keys(computers)[
            index
          ] as keyof SchemaComputers<ComputedPartOfSchema>
        ].compute(_id)),
    ),
  );
  return Object.keys(computers).reduce((acc, key, index) => {
    acc[key] = validValues[index];
    return acc;
  }, {} as TODO) as ComputedPartOfSchema;
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
