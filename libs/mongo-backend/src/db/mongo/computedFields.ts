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
 * Builds a dependency graph and performs topological sort to ensure proper computation order.
 */
const getComputationOrder = <T>(
  computedFields: SchemaComputers<T, any, any>,
): string[] => {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const [field, definition] of Object.entries(computedFields)) {
    graph.set(field, (definition as any).dependencies || []);
    inDegree.set(field, 0);
  }

  for (const [field, dependencies] of graph.entries()) {
    dependencies.forEach((dep) => {
      if (!inDegree.has(dep)) inDegree.set(dep, 0);
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    });
  }

  const queue = [...inDegree.entries()]
    .filter(([_, count]) => count === 0)
    .map(([key]) => key);
  const order: string[] = [];

  while (queue.length) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of graph.get(current) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  if (order.length !== graph.size) {
    throw new Error('Circular dependency detected in computed fields.');
  }

  return order;
};

/**
 * Caches a computed field value in Redis and prevents redundant computations.
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
      return JSON.parse(cachedValue);
    }
  }

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
 * Computes all fields in the correct order based on their dependencies.
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
    );
  }

  return finalValues as ComputedPartOfSchema;
};

/**
 * Refreshes cache if invalidation conditions are met.
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
    await cacheField(fieldName, myDoc, compute, true);
    activeComputations.delete(docKey);
    extraCallBack();
  }
};
