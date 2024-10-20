import { WhiteModels } from "@failean/shared-types";
import { requestForAccountModel } from "@failean/mongo-models";
import { safeDB } from "../../setup/mongoSetup";

export const getRequestForAccountModel = () => {
  if (!safeDB) throw new Error("Database not initialized");
  return safeDB.model<WhiteModels.Auth.WhiteRequestForAccount>(
    "requestForAccount",
    requestForAccountModel
  );
};
