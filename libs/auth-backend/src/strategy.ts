import { User } from '@the-libs/auth-shared';
import { ZXCVBNScore } from 'zxcvbn';
import { user } from './db/mongo/schemas';
import { GenEmailFunction } from '@the-libs/email-backend';
import { defaultGenPassResetEmail, defaultGenRegisterEmail } from './services';
import { ExtendedModel } from '@the-libs/mongo-backend';
import { StagingEnvironment } from '@the-libs/base-shared';

export enum MultiUserType {
  SINGLE = 'single',
  MULTI_BY_ROLES = 'multi_by_role',
  MULTI_COLLECTION = 'multi_collection',
}

export enum MultiClientType {
  SINGLE = 'single',
  MULTI = 'multi',
}

export enum VerifiedContactMethod {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum PasswordTypes {
  HASHED = 'hashed',
  OTP = 'one_time',
  EXTERNAL = 'external',
}

export enum MFA {
  OFF = 'off',
}

export enum ExternalIdentityProviders {
  GOOGLE = 'google',
}

export enum DefaultUserType {
  SINGLE = 'single',
}

export interface Strategy<
  RequiredFields extends object,
  OptionalFields extends object,
  UserEnum extends string | number | symbol = never,
  multiUserType_is_MULTI_COLLECTION extends boolean = false,
  multiUserType_is_SINGLE extends boolean = true,
  PostRegParams = object,
> {
  MIN_PASSWORD_STRENGTH: ZXCVBNScore;
  multiUserType: MultiUserType;
  multiClientType: MultiClientType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordTypes: PasswordTypes[];
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders[];
  modelMap: multiUserType_is_MULTI_COLLECTION extends true
    ? Record<UserEnum, () => Promise<ExtendedModel<User>>>
    : () => Promise<ExtendedModel<User>>;
  requiredFields: (keyof RequiredFields)[];
  requiredEnums: (keyof RequiredFields)[];
  optionalFields: (keyof OptionalFields)[];
  onCreateFields?: Partial<RequiredFields | OptionalFields>;
  genRegisterEmail: GenEmailFunction;
  genPassResetEmail: GenEmailFunction;
  enumValues?: multiUserType_is_SINGLE extends true ? undefined : UserEnum[];
  postRegistrationCB?: (savedUser: User, params: PostRegParams) => void;
  sendEmails?: Partial<{ [Key in StagingEnvironment]: boolean }>;
}

export const createStrategy = <
  RequiredFields extends object,
  OptionalFields extends object,
  UserEnum extends string | number | symbol,
  multiUserType_is_MULTI_COLLECTION extends boolean = false,
  multiUserType_is_SINGLE extends boolean = true,
  PostRegParams = object,
>(
  config: Omit<
    multiUserType_is_SINGLE extends true
      ? Omit<
          Strategy<
            RequiredFields,
            OptionalFields,
            UserEnum,
            multiUserType_is_MULTI_COLLECTION,
            multiUserType_is_SINGLE,
            PostRegParams
          >,
          'enumValues'
        >
      : Strategy<
          RequiredFields,
          OptionalFields,
          UserEnum,
          multiUserType_is_MULTI_COLLECTION,
          multiUserType_is_SINGLE,
          PostRegParams
        >,
    'modelMap'
  > & {
    modelMap: multiUserType_is_MULTI_COLLECTION extends true
      ? Record<UserEnum, () => Promise<ExtendedModel<User>>>
      : () => Promise<ExtendedModel<User>>;
  },
): Strategy<
  RequiredFields,
  OptionalFields,
  UserEnum,
  multiUserType_is_MULTI_COLLECTION,
  multiUserType_is_SINGLE,
  PostRegParams
> => config;

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
  passwordTypes: [PasswordTypes.HASHED],
  mfa: MFA.OFF,
  externalIdentityProviders: [],
  modelMap: async () => user(false, false),
});
