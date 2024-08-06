import { getModel } from "base-shared";
import { AmenityAccess, Building, WeekDays } from "offisito-backend";

export default () =>
  getModel<Building>("building", {
    buildingName: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
    },
    buildingAmenities: [
      {
        name: { type: String },
        access: {
          type: String,
          enum: Object.values(AmenityAccess),
        },
      },
    ],
    buildingAccess: [
      {
        dayOfWeek: { type: String, enum: Object.values(WeekDays) },
        time_range: {
          start: { type: String },
          end: { type: String },
        },
      },
    ],
    buildingDescription: { type: String },
    buildingImages: [{ type: String }],
    doorman: { type: Boolean },
    security: { type: Boolean },
    vip_service: { type: Boolean },
  });
