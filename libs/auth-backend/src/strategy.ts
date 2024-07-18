import { User } from './types';
import { Model } from 'mongoose';
import { ZXCVBNScore } from 'zxcvbn';
import { user } from './schemas';
import { SomeEnum, TODO } from 'base-backend';

export enum MultiUserType {
  SINGLE = 'single',
  MULTI_BY_ROLES = 'multi_by_role',
  MULTI_COLLECTION = 'multi_collection',
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

enum defaultUserType {
  'singe' = 'singe',
}

export interface Strategy<
  UserEnum extends SomeEnum<UserEnum>,
  multiUserType_is_MULTI_COLLECTION extends boolean,
> {
  MIN_PASSWORD_STRENGTH: ZXCVBNScore;
  multiUserType: MultiUserType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordType: PasswordType;
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders;
  modelMap: multiUserType_is_MULTI_COLLECTION extends true
    ? {
        [Key in keyof UserEnum as UserEnum[Key]]: () => Model<User>;
      }
    : () => Model<User>;
}

export function createStrategy<
  UserEnum extends SomeEnum<UserEnum>,
  MultiCollection extends boolean,
>(
  config: Omit<Strategy<UserEnum, MultiCollection>, 'modelMap'> & {
    modelMap: TODO;
  },
): Strategy<UserEnum, MultiCollection> {
  return config as Strategy<UserEnum, MultiCollection>;
}

export const defaultStrategy = createStrategy({
  MIN_PASSWORD_STRENGTH: 2,
  multiUserType: MultiUserType.SINGLE,
  verifiedContactMethod: VerifiedContactMethod.EMAIL,
  passwordType: PasswordType.HASHED,
  mfa: MFA.OFF,
  externalIdentityProviders: ExternalIdentityProviders.OFF,
  modelMap: () => user(false, false),
});
