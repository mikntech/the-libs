import { getModel } from 'base-shared';
import mongoose from 'mongoose';
import {
  AcceptedLeaseType,
  AmenityAccess,
  Asset,
  Status,
  AssetType,
} from 'offisito-backend';

export default () =>
  getModel<Asset>(
    'asset',
    {
      assetDescription: { type: String },
      roomNumber: { type: String },
      floorNumber: { type: String },
      photos: [{ type: String }],
      assetType: { type: String, enum: Object.values(AssetType) },
      publishingStatus: { type: String, enum: Object.values(Status) },
      peopleCapacity: { type: Number },
      roomSize: { type: String },
      leaseCondition: {
        monthlyPrice: { type: Number },
        leaseType: [
          {
            type: String,
            enum: Object.values(AcceptedLeaseType),
          },
        ],
        minLeaseContractInMonths: { type: Number },
      },
      address: {
        type: {
          street: { type: String },
          city: { type: String },
          country: { type: String },
        },
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      assetAmenities: [
        {
          name: { type: String },
          access: {
            type: String,
            enum: Object.values(AmenityAccess),
          },
        },
      ],
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    },
    [],
  );
