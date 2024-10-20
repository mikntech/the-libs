import { WhiteModels } from "@failean/shared-types";
import { tokenModel } from "@failean/mongo-models";
import { safeDB } from "../../setup/mongoSetup";

export const getTokenModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Accounts.WhiteToken>("token", tokenModel);
};
