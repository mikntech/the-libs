import { getModel } from "base-shared";
import mongoose from "mongoose";
import { AcceptedLeaseType, Booking, RequestStatus } from "offisito-backend";

export default () =>
  getModel<Booking>("booking", {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
    },
    daysInWeek: {
      sun: Boolean,
      mon: Boolean,
      tues: Boolean,
      wed: Boolean,
      thu: Boolean,
      fri: Boolean,
      sat: Boolean,
    },
    payment: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    leaseType: {
      type: String,
      enum: Object.values(AcceptedLeaseType),
    },
    contractLength: { type: Number },
    requestStatus: {
      type: String,
      enum: Object.values(RequestStatus),
    },
    readTS: { type: [Number] },
    note: { type: String },
  });
