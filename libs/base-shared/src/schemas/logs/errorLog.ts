import { getModel } from "../";
import { ErrorLog } from "../../types";

export const errorLog = () =>
  getModel<ErrorLog>("errorLog", {
    stringifiedError: {
      type: String,
    },
  });
