import type { Document as MDocument, Types } from 'mongoose';
import { DBDoc } from '@the-libs/mongo-backend';
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
> extends DBDoc {
  email: string;
  password: string;
  full_name: OptionalIfFalse<NameRequired, string>;
  profilePictureUri?: string;
  userType: OptionalIfTrue<MultyAtAll, USERTYPE>;
}

export interface SomeRequest<WithUserType extends boolean> extends DBDoc {
  email: string;
  userType: WithUserType extends true ? string : undefined;
  key: string;
}

export interface OTP extends DBDoc {
  user: Types.ObjectId;
  otp: string;
}
