import { getModel, SomeEnum } from '@base-shared';
import { userBasicSchema } from '../../abstract';
import { User } from '../../types';

export const user = <
  NameRequired extends boolean = false,
  ProfilePictureUriRequired extends boolean = false,
  TheEnum extends SomeEnum<TheEnum> = string,
>(
  multiUserTypeIsByRole: boolean,
  nameRequired: NameRequired extends true ? true : false,
  profilePictureUriRequired: ProfilePictureUriRequired extends true
    ? true
    : false,
  enumValues: TheEnum[] = [],
) =>
  getModel<User<NameRequired, ProfilePictureUriRequired>>('user', {
    ...userBasicSchema(nameRequired, profilePictureUriRequired),
    ...(multiUserTypeIsByRole
      ? {
          userType: {
            type: String,
            enum: enumValues as unknown[] as string[],
            required: true,
          },
        }
      : {}),
  });
