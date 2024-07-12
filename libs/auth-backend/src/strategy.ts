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

export interface Strategy<UserType = 'single'> {
  MIN_PASSWORD_STRENGTH: ZXCVBNScore;
  multiUserType: MultiUserType;
  verifiedContactMethod: VerifiedContactMethod;
  passwordType: PasswordType;
  mfa: MFA;
  externalIdentityProviders: ExternalIdentityProviders;
  modelMap: UserType extends 'single'
    ? () => Model<User>
    : { readonly [K in keyof UserType]: () => Model<User> };
}

export const defaultStrategy: Strategy = {
  MIN_PASSWORD_STRENGTH: 2,
  multiUserType: MultiUserType.SINGLE,
  verifiedContactMethod: VerifiedContactMethod.EMAIL,
  passwordType: PasswordType.HASHED,
  mfa: MFA.OFF,
  externalIdentityProviders: ExternalIdentityProviders.OFF,
  modelMap: () => user(false, false),
};
