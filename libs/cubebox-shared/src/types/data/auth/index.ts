import { Document as MDocument } from 'mongoose';
import { Types } from 'mongoose';
import { User as BaseUser } from '@auth-backend';

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  CLOSED = 'closed',
}

export enum AdminRole {
  ADMIN = 'admin',
  CREATOR = 'creator',
  EDITOR = 'editor',
  REGULAR = 'regular',
}

export enum ContractorRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MARKETING = 'marketing',
  ARCHITECT = 'architect',
  REGULAR = 'regular',
}

export interface User extends BaseUser<true, true> {
  full_name: string;
  email: string;
  profilePictureUri: string;
  password: string;
  phone_number: string;
  status: UserStatus;
}

export interface Admin extends User {
  role: AdminRole;
}

export interface Customer extends User {
  apartment_interests_ids: Types.ObjectId[];
}

export interface Contractor extends User {
  role: ContractorRole;
}

export enum UserType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  CONTRACTOR = 'contractor',
}

export interface RegistrationRequest extends MDocument {
  _id: Types.ObjectId;
  email: string;
  userType: UserType;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PassResetRequest extends MDocument {
  _id: Types.ObjectId;
  email: string;
  userType: UserType;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}
