import { Router } from "express";
import { highOrderHandler } from "base-backend";
import { TODO, UnauthorizedError } from "base-shared";
import { AuthenticatedRequest, User } from "auth-backend";
import {
  conversation,
  message,
  markMessagesAsRead,
  sendMessage,
} from "chat-backend";

const router = Router();

router.get(
  "/conversationMessages/:id",
  highOrderHandler((async (req: AuthenticatedRequest) => {
    const Message = message();
    const Conversation = conversation();
    const conversationR = await Conversation.findById(req.params["id"]);
    if (
      String((req.user as User)._id) !== conversationR?.hostId &&
      String((req.user as User)._id) !== conversationR?.guestId
    )
      throw new UnauthorizedError("You are not part of the conversation");
    const messages = await Message.find({
      conversationRId: String(conversationR?._id),
    });
    await markMessagesAsRead(messages, req.user as User, "queried");
    return { statusCode: 200, body: messages };
  }) as TODO),
);

enum UserType {
  a = 1,
  b = 2,
}

router.post(
  "/",
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!String((req.user as User)?._id))
      throw new UnauthorizedError("Not logged in");
    const { conversationIdOrAddressee, message } = req.body;

    return sendMessage<UserType>(
      req.user as User,
      Object.values(UserType),
      conversationIdOrAddressee,
      message,
    );
  }) as TODO,
);

export default router;
