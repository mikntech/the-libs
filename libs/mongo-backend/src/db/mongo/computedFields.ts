import type { Types } from 'mongoose';
import { createRedisInstance, cache } from '@the-libs/redis-backend';
import { ChangeStreamDocument } from 'mongodb';

export type Compute<FieldType> = (_id: Types.ObjectId) => Promise<FieldType>;

type Invalidate = (
  event: ChangeStreamDocument,
  _id: Types.ObjectId,
) => Promise<boolean>;

interface FieldDefinition<FieldType> {
  compute: Compute<FieldType>;
  invalidate?: Invalidate;
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

export const getComputed = async <ComputedPartOfSchema>(
  _id: Types.ObjectId,
  computers: SchemaComputers<ComputedPartOfSchema>,
) => {
  const cachedValues = await Promise.all(
    (
      await Promise.all(
        Object.keys(computers).map(async (key) =>
          JSON.parse(
            (await cacheField(
              _id,
              key,
              computers[key as keyof SchemaComputers<ComputedPartOfSchema>]
                .compute,
            )) ?? 'null',
          ),
        ),
      )
    ).map(
      async (value, i) =>
        value ??
        (await computers[
          Object.keys(computers)[i] as keyof ComputedPartOfSchema
        ].compute(_id)),
    ),
  );
  return Object.keys(computers).reduce(
    (acc, key, index) => {
      acc[key] = cachedValues[index];
      return acc;
    },
    {} as Record<string, any>,
  );
};

export const refreshCache = async <FieldType>(
  _id: Types.ObjectId,
  fieldName: string,
  { compute, invalidate }: FieldDefinition<FieldType>,
  event?: ChangeStreamDocument,
) =>
  (!invalidate || !event || (await invalidate(event, _id))) &&
  (await cacheField(_id, fieldName, compute));
