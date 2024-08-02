export * from "./schemas";

export type TODO = any;

export type SomeEnum<enumValues> = { [P in keyof enumValues]: string };

export interface Address {
  street?: string;
  city?: string;
  country?: string;
}
