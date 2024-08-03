import { Document } from "base-shared";

type OptionalIfFalse<IsRequired extends boolean, T> = IsRequired extends true
  ? T
  : T | undefined;

export interface User<
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false,
  MultyByRole extends boolean = false,
  USERTYPE = undefined,
> extends Document {
  email: string;
  password: string;
  full_name: OptionalIfFalse<NameRequired, string>;
  profilePictureUri: OptionalIfFalse<ProfilePictureUriRequired, string>;
  userType: OptionalIfFalse<MultyByRole, USERTYPE>;
}

export interface SomeRequest<WithUserType extends boolean> extends Document {
  email: string;
  userType: WithUserType extends true ? string : undefined;
  key: string;
}
