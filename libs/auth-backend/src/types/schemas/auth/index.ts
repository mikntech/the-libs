import { Document } from 'base-backend';

type OptionalIfFalse<IsRequired extends boolean, T> = IsRequired extends true
  ? T
  : T | undefined;

export interface User<
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false,
> extends Document {
  email: string;
  password: string;
  full_name: OptionalIfFalse<NameRequired, string>;
  profilePictureUri: OptionalIfFalse<ProfilePictureUriRequired, string>;
}

export interface SomeRequest<WithUserType extends boolean> extends Document {
  email: string;
  userType: WithUserType extends true ? string : undefined;
  key: string;
}
