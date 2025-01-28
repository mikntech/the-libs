import { SomeEnum } from '@the-libs/base-shared';
import { userBasicSchema } from './abstract';
import { User } from '@the-libs/auth-shared';
import { getModel } from '@the-libs/mongo-backend';
import { PasswordTypes, VerifiedContactMethod } from '../../../../strategy';

export const user = <
  NameRequired extends boolean = false,
  TheEnum extends SomeEnum<TheEnum> = string,
>(
  multiUserTypeIsAtAll: boolean,
  nameRequired: NameRequired extends true ? true : false,
  enumValues: TheEnum[] = [],
  passwordTypes: PasswordTypes[] = [PasswordTypes.HASHED],
  verifiedContactMethod: VerifiedContactMethod = VerifiedContactMethod.EMAIL,
) =>
  getModel<User<NameRequired>>('user', {
    ...userBasicSchema({ passwordTypes, verifiedContactMethod }, nameRequired),
    ...(multiUserTypeIsAtAll
      ? {}
      : {
          userType: {
            type: String,
            enum: enumValues as unknown[] as string[],
            required: true,
          },
        }),
  });
