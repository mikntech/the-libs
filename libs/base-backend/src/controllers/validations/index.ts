import { Document, Types } from 'mongoose';
import { InvalidEnumError, InvalidInputError } from '../../exceptions';

export const validateTruthy = <T = string>(value: T) => !!value;

export const validateInput = <T = string>(input: { [key: string]: T }) => {
  const [name, value] = Object.entries(input)[0];
  if (!validateTruthy(value))
    throw new InvalidInputError('didnt receive at all: ' + name);
  return name;
};

export const validateEnum = <T = string>(
  input: { [key: string]: T },
  theEnum: Record<string, string>,
) => {
  const name = validateInput({ input });
  const values: (string | number)[] = Object.values(theEnum);
  if (!values.some((value) => value === Object.entries(input)[0][1]))
    throw new InvalidEnumError(name, values);
};

export const validateDocument = <DOC extends Document>(doc: DOC): boolean => {
  return (
    validateTruthy(doc) &&
    validateTruthy(doc._id) &&
    Types.ObjectId.isValid(doc._id as Types.ObjectId)
  );
};
