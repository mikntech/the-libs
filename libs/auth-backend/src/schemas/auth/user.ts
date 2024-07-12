import { getModel } from 'base-backend';
import { userBasicSchema } from 'auth-backend';
import { User } from '../../types';

export const user = <
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false,
>(
  nameRequired: NameRequired extends true ? true : false,
  profilePictureUriRequired: ProfilePictureUriRequired extends true
    ? true
    : false,
) => {
  debugger;
  return getModel<User<NameRequired, ProfilePictureUriRequired>>('user', {
    ...userBasicSchema(nameRequired, profilePictureUriRequired),
  });
};
