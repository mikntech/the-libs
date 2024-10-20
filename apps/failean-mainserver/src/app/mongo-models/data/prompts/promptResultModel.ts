import { WhiteModels } from "@failean/shared-types";
import { promptResultModel } from "@failean/mongo-models";
import { safeDB } from "../../../setup/mongoSetup";

export const getPromptResultModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Data.Prompts.WhitePromptResult>(
    "promptResult",
    promptResultModel
  );
};
