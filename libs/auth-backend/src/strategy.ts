import { User } from './types';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Model } from 'mongoose';
import { ZXCVBNScore } from 'zxcvbn';
import { user } from './db/mongo/schemas';
import { SomeEnum, TODO } from '@the-libs/base-shared';
import { GenEmailFunction } from '@the-libs/email-backend';
import { defaultGenPassResetEmail, defaultGenRegisterEmail } from './services';

export enum MultiUserType {
  SINGLE = 'single',
  MULTI_BY_ROLES = 'multi_by_role',
  MULTI_COLLECTION = 'multi_collection',
}

export enum MultiClientType {
  SINGLE = 'single',
  MULTI = 'muti',
}

export enum VerifiedContactMethod {
  EMAIL = 'e-mail',
  SMS = 'sms',
}

export enum PasswordType {
  HASHED = 'hashed',
  OTP = 'one_time',
}

export enum MFA {
  OFF = 'off',
}

export enum ExternalIdentityProviders {
  OFF = 'off',
}

export enum defaultUserType {
  'singe' = 'singe',
}

export interface Strategy<
  RequiredFields extends {},
  OptionalFields extends {},
  UserEnum extends SomeEnum<UserEnum> = null,
  multiUserType_is_MULTI_COLLECTION extends boolean = false,
  multiUserType_is_SINGLE extends boolean = true,
> {
  MIN_PASSWORD_STRENGTH: ZXCVBNScore;
  multiUserType: MultiUserType;
  multiClientType: MultiClientType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordType: PasswordType;
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders;
  modelMap: multiUserType_is_MULTI_COLLECTION extends true
    ? {
        [Key in keyof UserEnum as UserEnum[Key]]: () => Model<User>;
      }
    : () => Model<User>;
  requiredFields: (keyof RequiredFields)[];
  requiredEnums: (keyof RequiredFields)[];
  optionalFields: (keyof OptionalFields)[];
  onCreateFields?: Partial<RequiredFields | OptionalFields>;
  genRegisterEmail: GenEmailFunction;
  genPassResetEmail: GenEmailFunction;
  enumValues: multiUserType_is_SINGLE extends true ? undefined : UserEnum[];
}

export const createStrategy = <
  RequiredFields extends {},
  OptionalFields extends {},
  UserEnum extends SomeEnum<UserEnum> = null,
  multiUserType_is_MULTI_COLLECTION extends boolean = false,
  multiUserType_is_SINGLE extends boolean = true,
>(
  config: Omit<
    multiUserType_is_SINGLE extends true
      ? Omit<
          Strategy<
            RequiredFields,
            OptionalFields,
            UserEnum,
            multiUserType_is_MULTI_COLLECTION,
            multiUserType_is_SINGLE
          >,
          'enumValues'
        >
      : Strategy<
          RequiredFields,
          OptionalFields,
          UserEnum,
          multiUserType_is_MULTI_COLLECTION,
          multiUserType_is_SINGLE
        >,
    'modelMap'
  > & {
    modelMap: TODO;
  },
): Strategy<
  RequiredFields,
  OptionalFields,
  UserEnum,
  multiUserType_is_MULTI_COLLECTION,
  multiUserType_is_SINGLE
> =>
  config as unknown as Strategy<
    RequiredFields,
    OptionalFields,
    UserEnum,
    multiUserType_is_MULTI_COLLECTION,
    multiUserType_is_SINGLE
  >;

export const defaultStrategy = createStrategy({
  genRegisterEmail: defaultGenRegisterEmail,
  genPassResetEmail: defaultGenPassResetEmail,
  optionalFields: [],
  requiredEnums: [],
  requiredFields: [],
  MIN_PASSWORD_STRENGTH: 2,
  multiUserType: MultiUserType.SINGLE,
  multiClientType: MultiClientType.SINGLE,
  verifiedContactMethod: VerifiedContactMethod.EMAIL,
  passwordType: PasswordType.HASHED,
  mfa: MFA.OFF,
  externalIdentityProviders: ExternalIdentityProviders.OFF,
  modelMap: () => user(false, false, false),
});
