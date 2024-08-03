import { getModel } from "base-shared";
import { SomeRequest } from "../../types";
import { requestBasicSchema } from "../../abstract";

export const passResetRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    "passResetRequest",
    requestBasicSchema(userTypeRelevant),
  );
