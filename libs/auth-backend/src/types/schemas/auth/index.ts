import { Document as MDocument, Types } from 'mongoose';

type OptionalIfFalse<IsRequired extends boolean, T> = IsRequired extends true
  ? T
  : T | undefined;

export interface User<
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false,
  MultyByRole extends boolean = false,
  USERTYPE = undefined,
> extends MDocument<Types.ObjectId> {
  email: string;
  password: string;
  full_name: OptionalIfFalse<NameRequired, string>;
  profilePictureUri: OptionalIfFalse<ProfilePictureUriRequired, string>;
  userType: OptionalIfFalse<MultyByRole, USERTYPE>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SomeRequest<WithUserType extends boolean>
  extends MDocument<Types.ObjectId> {
  email: string;
  userType: WithUserType extends true ? string : undefined;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}
