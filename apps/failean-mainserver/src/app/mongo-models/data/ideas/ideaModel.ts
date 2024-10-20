import { WhiteModels } from "@failean/shared-types";
import { ideaModel } from "@failean/mongo-models";
import { safeDB } from "../../../setup/mongoSetup";

export const getIdeaModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Data.Ideas.WhiteIdea>("idea", ideaModel);
};
