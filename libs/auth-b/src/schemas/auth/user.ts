import { getModel } from 'gbase-b';
import { userBasicSchema } from 'auth-b';
import { User } from '../../types';

export const user = <
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false
>(
  nameRequired: NameRequired extends true ? true : false,
  profilePictureUriRequired: ProfilePictureUriRequired extends true
    ? true
    : false
) =>
  getModel<User<NameRequired, ProfilePictureUriRequired>>('user', {
    ...userBasicSchema(nameRequired, profilePictureUriRequired),
  });
