import { User } from './types';
import { Model } from 'mongoose';
import { ZXCVBNScore } from 'zxcvbn';
import { user } from './schemas';

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

export interface Strategy<UserEnum = defaultUserType> {
  MIN_PASSWORD_STRENGTH: ZXCVBNScore;
  multiUserType: MultiUserType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordType: PasswordType;
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders;
  modelMap: MultiUserType extends MultiUserType.MULTI_COLLECTION
    ? { readonly [K in keyof UserEnum]: () => Model<User> }
    : () => Model<User>;
}

export const defaultStrategy: Strategy<defaultUserType> = {
  MIN_PASSWORD_STRENGTH: 2,
  multiUserType: MultiUserType.SINGLE,
  verifiedContactMethod: VerifiedContactMethod.EMAIL,
  passwordType: PasswordType.HASHED,
  mfa: MFA.OFF,
  externalIdentityProviders: ExternalIdentityProviders.OFF,
  modelMap: () => user(false, false),
};
