import { Document as MDocument, Types } from 'mongoose';

export enum BusinessType {
  'DEVELOPER' = 'developer',
  'BROKER' = 'broker',
  'AGENT' = 'agent',
}

export interface Business extends MDocument {
  _id: Types.ObjectId;
  id: string; // TODO: for what? consider remove
  name: string;
  business_hp_id: number;
  business_type: BusinessType;
  about_business: string;
  email: string;
  phone_number: string;
  alternative_phone_number: string;
  business_image: string;
  business_logo: string;
  // contractor_owner_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessCmp { // TODO: for what? consider remove
  _id: string;
  name: string;
  business_hp_id: number;
  business_type: BusinessType;
  about_business: string;
  email: string;
  phone_number: string;
  alternative_phone_number: string;
  business_image: string;
  business_logo: string;
}
