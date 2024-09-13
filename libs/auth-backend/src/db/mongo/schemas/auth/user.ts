import { SomeEnum } from '@the-libs/base-shared';
import { userBasicSchema } from './abstract';
import { User } from '@the-libs/auth-shared';
import { getModel } from '@the-libs/mongo-backend';

export const user = <
  NameRequired extends boolean = false,
  TheEnum extends SomeEnum<TheEnum> = string,
>(
  multiUserTypeIsAtAll: boolean,
  nameRequired: NameRequired extends true ? true : false,
  enumValues: TheEnum[] = [],
) =>
  getModel<User<NameRequired>>('user', {
    ...userBasicSchema(nameRequired),
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
