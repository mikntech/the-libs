import type { Types } from 'mongoose';
import { createRedisInstance, cache } from '@the-libs/redis-backend';
import { ChangeStreamDocument } from 'mongodb';

/*enum DepLevel {
  NONE,
  ANY_CHANGE_IN_DB,
  ANY_CHANGE_IN_COLLECTION,
  ANY_CHANGE_IN_DOCUMENT,
  ANY_CHANGE_IN_FIELD,
  FILTERED_CHANGE_IN_FIELD,
}*/

enum LogicalBinaryOperands {
  OR = 'or',
  AND = 'and',
}

interface Conditions /*<ARGSType extends Array<any>>*/ {
  operand: LogicalBinaryOperands;
  theConditions: ((event: ChangeStreamDocument) => boolean)[];
}

interface Dependencies {
  /*
  level: DepLevel;
*/
  conditions: Conditions /*<
    /!* DepLevel extends 0
      ? []
      : DepLevel extends 1
        ? [Pick<ChangeStreamUpdateDocument, 'ns'>]
        : DepLevel extends 2
          ? [Pick<ChangeStreamUpdateDocument, 'ns'>]
          : DepLevel extends 3
            ? [Pick<ChangeStreamUpdateDocument, '_id'>]
            : DepLevel extends 4
              ? [Pick<ChangeStreamUpdateDocument, 'updateDescription'>]
              : [
                  Pick<ChangeStreamUpdateDocument, 'updateDescription'>,
                  Pick<ChangeStreamUpdateDocument, 'fullDocumentBeforeChange'>,
                  Pick<ChangeStreamUpdateDocument, 'fullDocument'>,
                ]*!/ [event: ChangeStreamDocument]
  >;*/;
}

interface FieldComputer<FieldType> {
  theComputer: (_id: Types.ObjectId) => Promise<FieldType>;
  dependencies?: Dependencies;
}

export type SchemaComputers<ComputedPartOfSchema> = {
  [Key in keyof ComputedPartOfSchema]: FieldComputer<ComputedPartOfSchema[Key]>;
};

const eventMeetsConditions = /*<ARGSType extends Array<any>>*/ (
  event: ChangeStreamDocument,
  { operand, theConditions }: Conditions /*<ARGSType>*/,
) => {
  let result;
  switch (operand) {
    case LogicalBinaryOperands.OR:
      result = false;
      result = theConditions.some((condition) => condition(event));
      break;
    case LogicalBinaryOperands.AND:
      result = true;
      result = !theConditions.some((condition) => !condition(event));
      break;
  }
  return result;
};

/*const computeAndSet = async <ComputedPartOfSchema>(
  _id: Types.ObjectId,
  computers: SchemaComputers<ComputedPartOfSchema>,
) =>
  await Promise.all(
    Object.keys(computers).map(
      async (key) =>
        await set(
          await createRedisInstance(),
          JSON.stringify({ _id: String(_id), key }),
          JSON.stringify(
            await computers[key as keyof ComputedPartOfSchema].theComputer(_id),
          ),
        ),
    ),
  );*/

const cacheH = async <ComputedPartOfSchema>(
  _id: Types.ObjectId,
  key: string,
  computers: SchemaComputers<ComputedPartOfSchema>,
) =>
  cache(
    await createRedisInstance(),
    JSON.stringify({ _id: String(_id), key }),
    async () =>
      JSON.stringify(
        await computers[key as keyof ComputedPartOfSchema].theComputer(_id),
      ),
  );

export const getComputed = async <ComputedPartOfSchema>(
  _id: Types.ObjectId,
  computers: SchemaComputers<ComputedPartOfSchema>,
) => {
  const cachedValues = await Promise.all(
    (
      await Promise.all(
        Object.keys(computers).map(async (key) =>
          JSON.parse((await cacheH(_id, key, computers)) ?? 'null'),
        ),
      )
    ).map(
      async (value, i) =>
        value ??
        (await computers[
          Object.keys(computers)[i] as keyof ComputedPartOfSchema
        ].theComputer(_id)),
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

export const invalidate = async <FieldType>(
  _id: Types.ObjectId,
  fieldName: string,
  { dependencies, theComputer }: FieldComputer<FieldType>,
  event?: ChangeStreamDocument,
) => {
  let needToInvalidate;
  if (!dependencies || !event /*|| dependencies.level === DepLevel.NONE*/)
    needToInvalidate = true;
  else {
    /*switch (dependencies.level) {
      case DepLevel.ANY_CHANGE_IN_DB:
        if (
          event &&
          (event.operationType === 'insert' ||
            event.operationType === 'update' ||
            event.operationType === 'replace') &&
          eventMeetsConditions(event, dependencies.conditions)
        )
          needToInvalidate = true;
        break;
      case DepLevel.ANY_CHANGE_IN_COLLECTION:
        if (event?._id) {
        }
        break;

        more cases will be the same now....
    }*/
    needToInvalidate = eventMeetsConditions(event, dependencies.conditions);
  }
  needToInvalidate && /*set*/ (await cacheH(_id, fieldName, theComputer));
};
