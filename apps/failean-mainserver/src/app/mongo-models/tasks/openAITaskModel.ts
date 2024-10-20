import {WhiteModels} from "@failean/shared-types";
import {safeDB} from "../../setup/mongoSetup";
import {openAITask} from "@failean/mongo-models";

export const getAITaskModel = () => {
    if (!safeDB) throw new Error("Database not initialized");
    return safeDB.model<WhiteModels.Tasks.OpenAITaskModel>("openAITask", openAITask);
};
