import type { Document as MDocument, Types } from 'mongoose';
type OptionalIfFalse<IsRequired extends boolean, T> = IsRequired extends true
  ? T
  : T | undefined;

type OptionalIfTrue<IsRequired extends boolean, T> = IsRequired extends false
  ? T | undefined
  : T;

export interface User<
  NameRequired extends boolean = false,
  MultyAtAll extends boolean = false,
  USERTYPE = undefined,
> extends MDocument {
  _id: Types.ObjectId;
  email: string;
  password: string;
  full_name: OptionalIfFalse<NameRequired, string>;
  profilePictureUri?: string;
  userType: OptionalIfTrue<MultyAtAll, USERTYPE>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SomeRequest<WithUserType extends boolean> extends MDocument {
  _id: Types.ObjectId;
  email: string;
  userType: WithUserType extends true ? string : undefined;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}
