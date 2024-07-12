import { User } from './types';
import { Model } from 'mongoose';
import { user } from './schemas';

enum MultiUserType {
  SINGLE = 'single',
  MULTI_BY_ROLES = 'multi_by_role',
  MULTI_COLLECTION = 'multi_collection',
}

enum VerifiedContactMethod {
  EMAIL = 'e-mail',
  SMS = 'sms',
}

enum PasswordType {
  HASHED = 'hashed',
  OTP = 'one_time',
}

enum MFA {
  OFF = 'off',
}

enum ExternalIdentityProviders {
  OFF = 'off',
}

export interface Strategy<UserType = 'single'> {
  MIN_PASSWORD_STRENGTH: number;
  multiUserType: MultiUserType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordType: PasswordType;
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders;
  modelMap: UserType extends 'single'
    ? Model<User>
    : { readonly [K in keyof UserType]: UserType[K] };
}

export const defaultStrategy: Strategy = {
  MIN_PASSWORD_STRENGTH: 2,
  multiUserType: MultiUserType.SINGLE,
  verifiedContactMethod: VerifiedContactMethod.EMAIL,
  passwordType: PasswordType.HASHED,
  mfa: MFA.OFF,
  externalIdentityProviders: ExternalIdentityProviders.OFF,
  modelMap: user(false, false),
};
