import { getModel } from "..";
import { Conversation } from "@offisito/shared";

export default () =>
  getModel<Conversation>("conversation", {
    hostId: {
      type: String,
    },
    guestId: {
      type: String,
    },
    hiddenFor: [{ type: String }],
  });
