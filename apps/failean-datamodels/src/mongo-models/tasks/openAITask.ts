import mongoose from 'mongoose';

const openAITask = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    finishTime: { type: Date, required: false },
    status: { type: String, required: true },
    promptResIDOrReason: { type: String, required: false },
    userID: { type: String, required: true },
    promptName: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default openAITask;
