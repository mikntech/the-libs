import { Document, Types } from 'mongoose';
import { InvalidEnumError, InvalidInputError } from '../../exceptions';
import { SomeEnum } from '../../types';

export const validateTruthy = <T = string>(value: T) => !!value;

export const validateInput = <T = string>(
  input: { [key: string]: T },
  extraPath: string = '',
) => {
  const [name, value] = Object.entries(input)[0];
  if (!validateTruthy(value))
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

export const validateDocument = <DOC extends Document>(doc: DOC): boolean => {
  return (
    validateTruthy(doc) &&
    validateTruthy(doc._id) &&
    Types.ObjectId.isValid(doc._id as Types.ObjectId)
  );
};
