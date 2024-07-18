export * from './schemas';

export type TODO = any;

export type SomeEnum<enumValues> = { [P in keyof enumValues]: string };
