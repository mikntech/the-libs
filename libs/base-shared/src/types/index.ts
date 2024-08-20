export * from './db/mongo/schemas';

export type TODO = any;

export type SomeEnum<enumValues> = { [P in keyof enumValues]: string };

export interface SimpleAddress {
  street?: string;
  city?: string;
  country?: string;
}
