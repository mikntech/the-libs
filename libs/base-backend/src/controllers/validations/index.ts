import {
  QueryWithHelpers,
  isValidObjectId,
  Types,
  Document as MDocument,
} from 'mongoose';
import {
  InvalidEnumError,
  InvalidInputError,
  ResourceNotFoundError,
  SomeEnum,
} from '@base-shared';
import { findDocs } from '../data';

export const validateInput = <T = string>(
  input: { [key: string]: T },
  extraPath: string = '',
) => {
  const [name, value] = Object.entries(input)[0];
  if (!value)
    throw new InvalidInputError(
      'didnt receive at all: ' +
        name +
        (extraPath && ' (under: ' + extraPath + ')'),
    );
  return value;
};

export const validateEnum = <ENUM extends SomeEnum<ENUM>>(
  input: ENUM,
  enumValues: ENUM[],
) => {
  const name = validateInput({ input });
  if (!enumValues.some((value) => value === input))
    throw new InvalidEnumError(
      Object.keys(name)[0],
      enumValues.map((x) => String(x)),
    );
};

export const validateDocument = (doc: { _id?: Types.ObjectId }): boolean =>
  doc && !!doc._id && isValidObjectId(doc._id);

export const findAndValidate = async <
  isArray extends boolean,
  SCHEMA extends MDocument<Types.ObjectId> = MDocument<Types.ObjectId>,
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<SCHEMA> : SCHEMA | null,
    SCHEMA
  >,
  customDescription: string,
  lean: boolean = true,
) => {
  try {
    const res = await findDocs<isArray, SCHEMA>(query, lean);
    if (
      Array.isArray(res)
        ? !res.some((doc) => !validateDocument(doc))
        : res && validateDocument(res)
    )
      return res;
  } catch {}
  throw new ResourceNotFoundError(customDescription);
};
