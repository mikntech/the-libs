export const baseEvent = {
  idOnSource: { type: String, required: true, unique: true },
  tsOnSource: { type: Number, required: true },
  wasHandled: { type: Boolean, required: true },
};
