import { getModel } from "base-shared";
import mongoose from "mongoose";
import { Company } from "offisito-backend";

export default () =>
  getModel<Company>("companie", {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    companyName: { type: String },
    companyInHold: { type: String },
    owner: { type: Boolean },
    contractEndDate: { type: Date },
    subleasePermission: { type: Boolean },
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    floor: [
      {
        floorNumber: { type: String },
        fullFloor: { type: Boolean, default: false },
        floorMap: [{ type: String }],
        floorAmenities: [
          {
            name: { type: String },
            access: {
              type: String,
              enum: ["free", "addCost", "member"],
            },
          },
        ],
        kitchenAmenities: [{ type: String }],
      },
    ],
  });
