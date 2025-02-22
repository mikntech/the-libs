import {
  createRedisInstance,
  cache,
  get,
  withTimeout,
} from '@the-libs/redis-backend';
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
  global?: boolean;
  dependencies?: string[];
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

/**
 * Generate computation order using topological sorting.
 */
const getComputationOrder = <T>(
  computedFields: SchemaComputers<T, any, any>,
): string[] => {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  // Build graph with explicit typing
  for (const [field, definition] of Object.entries(
    computedFields as Record<string, FieldDefinition<any, any, any>>,
  )) {
    graph[field] = definition.dependencies ?? [];
    inDegree[field] = 0;
  }

  // Compute in-degree for topological sorting
  for (const deps of Object.values(graph)) {
    deps.forEach((dep) => {
      if (inDegree[dep] !== undefined) inDegree[dep]++;
    });
  }

  // Perform topological sorting (Kahn's algorithm)
  const order: string[] = [];
  const queue = Object.keys(inDegree).filter((key) => inDegree[key] === 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of graph[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (order.length !== Object.keys(graph).length) {
    throw new Error('❌ Circular dependency detected in computed fields.');
  }

  return order;
};

/**
 * Cache computed field values with Redis.
 */
const cacheField = async <FieldType, DBFullDoc extends MDocument>(
  fieldName: string,
  fullDoc: DBFullDoc,
  compute: Compute<FieldType, DBFullDoc>,
  global: boolean,
  forceRefresh = false,
) => {
  const docKey = `${String(fullDoc._id)}:${fieldName}`;
  const redisInstance = await createRedisInstance('default', true);

  if (activeComputations.has(docKey)) {
    return null;
  }

  if (!forceRefresh) {
    const cachedValue = await get(
      redisInstance,
      'mikache_' +
        JSON.stringify({
          _id: global ? '-global-' : String(fullDoc._id),
          key: fieldName,
        }),
    );
    if (cachedValue !== null) {
      return JSON.parse(cachedValue);
    }
  }

  // Prevent further recursion
  activeComputations.add(docKey);
  try {
    const value = await compute(fullDoc);
    await cache(
      redisInstance,
      'mikache_' + JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
      async () => JSON.stringify(value),
    );
    return value;
  } finally {
    activeComputations.delete(docKey);
  }
};

const tryToFixNulls = async <T = any>(obj: T): Promise<T> => {
  const redisInstance = await createRedisInstance();
  let parsedObj: T;
  try {
    parsedObj = typeof obj === 'string' ? JSON.parse(obj) : obj;
  } catch {
    return obj;
  }
  if (typeof parsedObj !== 'object' || parsedObj === null) return parsedObj;

  const keys = Object.keys(parsedObj);

  for (const key of keys) {
    const value = parsedObj[key as keyof T];
    if (value === null) {
      try {
        const possibleId = Object.values(parsedObj).find((val) =>
          mongoose.isValidObjectId(val),
        );
        if (possibleId) {
          const cachedValue = await get(
            redisInstance,
            'mikache_' + JSON.stringify({ _id: possibleId, key }),
          );
          if (cachedValue) {
            parsedObj[key as keyof T] = JSON.parse(cachedValue);
          }
        }
      } catch {}
    } else if (typeof value === 'object') {
      parsedObj[key as keyof T] = await tryToFixNulls(
        parsedObj[key as keyof T],
      );
    }
  }
  return parsedObj;
};

/**
 * Computes and caches all fields based on dependencies.
 */
export const getCached = async <
  ComputedPartOfSchema,
  DBFullDoc extends MDocument,
>(
  fullDoc: DBFullDoc,
  computers: SchemaComputers<ComputedPartOfSchema, DBFullDoc, any>,
): Promise<ComputedPartOfSchema> => {
  const order = getComputationOrder(computers);
  const finalValues: Partial<ComputedPartOfSchema> = {};

  for (const field of order) {
    finalValues[field as keyof ComputedPartOfSchema] = await cacheField(
      field,
      fullDoc,
      computers[field as keyof ComputedPartOfSchema].compute,
      computers[field as keyof ComputedPartOfSchema].global ?? false,
    );
    finalValues[field as keyof ComputedPartOfSchema] = await tryToFixNulls(
      finalValues[field as keyof ComputedPartOfSchema],
    );
  }

  return finalValues as ComputedPartOfSchema;
};

/**
 * Refresh the cache for a specific field if invalidation conditions met.
 */
export const refreshCacheIfNeeded = async <
  FieldType,
  DBFullDoc extends MDocument,
>(
  myDoc: DBFullDoc,
  changed_Id: string,
  changedColl: string,
  fieldName: string,
  { compute, invalidate, global }: FieldDefinition<FieldType, DBFullDoc, any>,
  extraCallBack: () => void,
) => {
  const docKey = `${String(myDoc._id)}:${fieldName}`;

  if (activeComputations.has(docKey)) {
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
    await cacheField(fieldName, myDoc, compute, global ?? false, true);
    extraCallBack();
  }
};

export const clearAllCache = async (ids: string[]) => {
  try {
    const redis = await createRedisInstance();
    const keys = await withTimeout(
      ids.length === 0
        ? redis.keys('mikache_*')
        : (
            await Promise.all(
              ids.map(async (id) => redis.keys(`mikache_{"_id":"${id}*`)),
            )
          ).flat(),
      5000,
    );
    if (keys.length === 0) {
      return;
    }
    for (const key of keys) {
      await withTimeout(redis.del(key), 5000);
    }
  } catch (error) {
    console.error(error);
  }
};
