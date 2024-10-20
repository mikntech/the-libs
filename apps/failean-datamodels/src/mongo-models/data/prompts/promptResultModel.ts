import mongoose from "mongoose";

const promptResultModel = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, required: true },
    ideaID: { type: mongoose.Schema.Types.ObjectId, required: true },
    promptName: { type: String, required: true },
    reason: {
      type: String,
      enum: ["run", "feedback", "save"],
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default promptResultModel;
