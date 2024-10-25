import mongoose from 'mongoose';

const taskModel = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, required: true },
    ideaID: { type: mongoose.Schema.Types.ObjectId, required: true },
    promptName: { type: String, required: true },
    taskId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default taskModel;
