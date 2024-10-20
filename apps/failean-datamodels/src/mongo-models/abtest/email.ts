import mongoose from "mongoose";

const emailModel = new mongoose.Schema(
  {
      email: { type: String, required: false },
      product: { type: String, required: false },
      emailSent: { type: String, required: false },
      deleted: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default emailModel;
