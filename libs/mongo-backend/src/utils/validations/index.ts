import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Document as MDocument, QueryWithHelpers } from 'mongoose';
const { isValidObjectId } = require('mongoose');
import {
  InvalidEnumError,
  InvalidInputError,
  ResourceNotFoundError,
  SomeEnum,
} from '@the-libs/base-shared';
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

type E<EE> = SomeEnum<EE> | string | number | symbol;

export const validateEnum = <ENUM extends E<ENUM>>(
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

export const validateDocument = (doc: any): boolean =>
  doc && !!doc._id && isValidObjectId(doc._id);

export const findAndValidate = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
>(
  query: QueryWithHelpers<isArray extends true ? DocI[] : DocI | null, DocI>,
  customDescription: string,
  lean: boolean = true,
): Promise<isArray extends true ? DocI[] : DocI> => {
  try {
    const res = await findDocs<isArray, DocI>(query, lean);

    // Narrow the result type to ensure no null values
    if (res === null || (Array.isArray(res) && res.length === 0)) {
      throw new ResourceNotFoundError(customDescription);
    }

    // Validate the result
    const isValid = Array.isArray(res)
      ? res.every((doc) => validateDocument(doc))
      : validateDocument(res);

    if (!isValid) {
      throw new Error('Validation failed for one or more documents');
    }

    // Safe return after validation
    return res as isArray extends true ? DocI[] : DocI;
  } catch (err) {
    throw new ResourceNotFoundError(customDescription);
  }
};
