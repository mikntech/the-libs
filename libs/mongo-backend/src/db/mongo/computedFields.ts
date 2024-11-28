import type { Types } from 'mongoose';
import { createRedisInstance, cache } from '@the-libs/redis-backend';
import type { ChangeStreamDocument, ChangeStreamUpdateDocument } from 'mongodb';
import { getModelFromMap } from './modelRegistry';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { models } = require('mongoose');

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
  event?: ChangeStreamUpdateDocument,
) => {
  if (event?.updateDescription?.updatedFields?.['_cacheUpdated']) {
    console.log('Skipping cache-originated change');
    return;
  }
  const collectionName = event?.ns?.coll;
  if (!collectionName) return;

  const model = getModelFromMap(collectionName) || models[collectionName];
  if (!model)
    throw new Error(`No model found for collection: ${collectionName}`);

  const documentId = event?.documentKey._id;
  if (!documentId) return;

  console.log(
    `Handling change for collection: ${collectionName}, ID: ${documentId}`,
  );
  const doc = await model.findById(documentId);
  console.log('Document from model:', doc);

  const cacheUpdate = !invalidate || !event || (await invalidate(event, _id));

  if (cacheUpdate) {
    await cacheField(_id, fieldName, compute);

    // Add a marker to avoid triggering watchers
    await model.updateOne({ _id }, { $set: { _cacheUpdated: true } });
  }

  return cacheUpdate;
};
