import { WhiteModels } from "@failean/shared-types";
import { taskModel } from "@failean/mongo-models";
import { safeDB } from "../../../setup/mongoSetup";

export const getTaskModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Data.Prompts.WhiteTask>("task", taskModel);
};
