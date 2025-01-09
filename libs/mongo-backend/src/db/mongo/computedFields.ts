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
  dependencies?: string[]; // Added dependencies for proper ordering
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
 * Generate the correct order of fields to compute based on their dependencies.
 * Uses topological sorting to resolve fields in the right order.
 */
const getComputationOrder = <T>(
  computedFields: SchemaComputers<T, any, any>,
): string[] => {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  // Build the dependency graph
  for (const [field, definition] of Object.entries(computedFields)) {
    graph[field] = (definition as any).dependencies || [];
    inDegree[field] = 0;
  }

  // Calculate in-degree
  for (const deps of Object.values(graph)) {
    deps.forEach((dep) => {
      if (inDegree[dep] !== undefined) inDegree[dep]++;
    });
  }

  // Perform topological sort
  const order: string[] = [];
  const queue = Object.keys(inDegree).filter((key) => inDegree[key] === 0);

  while (queue.length) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of graph[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (order.length !== Object.keys(graph).length) {
    throw new Error('Circular dependency detected in computed fields.');
  }

  return order;
};

/**
 * Caches a computed field value in Redis.
 */
const cacheField = async <FieldType, DBFullDoc extends MDocument>(
  fieldName: string,
  fullDoc: DBFullDoc,
  compute: Compute<FieldType, DBFullDoc>,
  forceRefresh = false,
) => {
  const docKey = `${String(fullDoc._id)}:${fieldName}`;
  const redisInstance = await createRedisInstance();

  if (activeComputations.has(docKey)) {
    return null;
  }

  if (!forceRefresh) {
    const cachedValue = await get(
      redisInstance,
      JSON.stringify({ _id: String(fullDoc._id), key: fieldName }),
    );
    if (cachedValue !== null) {
      return JSON.parse(cachedValue); // Early return if cache exists
    }
  }

  // Mark as actively computing to avoid recursion
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

/**
 * Computes and caches all computed fields based on their dependencies
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
    await cacheField(
      field,
      fullDoc,
      computers[field as keyof ComputedPartOfSchema].compute,
    );
    finalValues[field as keyof ComputedPartOfSchema] = value;
  }

  return finalValues as ComputedPartOfSchema;
};

/**
 * Refresh cache if invalidation conditions are met.
 */
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
    activeComputations.add(docKey);
    await cacheField(fieldName, myDoc, compute, true); // Force refresh cache
    activeComputations.delete(docKey);
    extraCallBack();
  }
};
