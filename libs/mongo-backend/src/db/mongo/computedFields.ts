import type { Types } from 'mongoose';

type FieldComputer<FT> = (_id: Types.ObjectId) => Promise<FT>;

export type SchemaComputers<IS> = {
  [K in keyof IS]: FieldComputer<IS[K]>;
};
