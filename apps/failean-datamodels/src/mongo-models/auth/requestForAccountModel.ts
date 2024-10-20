import mongoose from "mongoose";

const requestForAccountModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    idea: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default requestForAccountModel;
