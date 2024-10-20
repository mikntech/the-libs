import { WhiteModels } from "@failean/shared-types";
import { emailModel } from "@failean/mongo-models";
import { safeDB } from "../../setup/mongoSetup";

export const getEmailModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.ABTest.EmailModel>("email", emailModel);
};
