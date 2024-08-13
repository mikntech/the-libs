import { AirDirection } from '../projects';
import { Document as MDocument, Types } from 'mongoose';

export interface ApartmentPlan extends MDocument {
  _id: Types.ObjectId;
  urn: string;
  direction: AirDirection;
  bedroom_number: number;
  bathroom_number: number;
  balcony: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
