import { Document, Types } from 'mongoose';
import { InvalidEnumError, InvalidInputError } from '../../exceptions';
import { TODO } from '../../types';

export const validateTruthy = <T = string>(value: T) => !!value;

export const validateInput = <T = string>(input: { [key: string]: T }) => {
  const [name, value] = Object.entries(input)[0];
  if (!validateTruthy(value))
    throw new InvalidInputError('didnt receive at all: ' + name);
  return value;
};

export const validateEnum = <T = string>(
  input: { [key: string]: T },
  theEnum: Record<string, string>,
) => {
  const name = validateInput({ input });
  const values: string[] = Object.values(theEnum);
  if (!values.some((value) => value === Object.entries(input)[0][1]))
    throw new InvalidEnumError(Object.keys(name)[0], values);
};

export const validateDocument = <DOC extends Document>(doc: DOC): boolean => {
  return (
    validateTruthy(doc) &&
    validateTruthy(doc._id) &&
    Types.ObjectId.isValid(doc._id as Types.ObjectId)
  );
};
