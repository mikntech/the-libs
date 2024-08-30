import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Document as MDocument, Types } from 'mongoose';
const { QueryWithHelpers, isValidObjectId } = require('mongoose');
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

export const validateDocument = (doc: MDocument): boolean =>
  doc && !!doc._id && isValidObjectId(doc._id);

export const findAndValidate = async <
  isArray extends boolean,
  DocI extends MDocument = MDocument,
>(
  query: QueryWithHelpers<
    isArray extends true ? Array<DocI> : DocI | null,
    DocI
  >,
  customDescription: string,
  lean: boolean = true,
) => {
  try {
    const res = await findDocs<isArray, DocI>(query, lean);
    if (
      Array.isArray(res)
        ? !res.some((doc) => !validateDocument(doc))
        : res && validateDocument(res)
    )
      return res;
  } catch {}
  throw new ResourceNotFoundError(customDescription);
};
