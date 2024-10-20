import { WhiteModels } from "@failean/shared-types";
import { userModel } from "@failean/mongo-models";
import { safeDB } from "../../setup/mongoSetup";

export const getUserModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Auth.WhiteUser>("user", userModel);
};
