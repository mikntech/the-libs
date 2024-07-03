import { Router } from "express";
import { AuthenticatedRequest } from "../../middleware";
import conversationModel from "../../../services/mongo/chats/conversationModel";
import messageModel from "../../../services/mongo/chats/messageModel";
import { SendMessageReq, User, UserType } from "@offisito/shared";
import { markMessagesAsRead } from "./index";
import userModel from "../../../services/mongo/auth/userModel";
import companyModel from "../../../services/mongo/assets/companyModel";

const router = Router();

router.get(
  "/conversationMessages/:id",
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const Message = messageModel();
      const Conversation = conversationModel();
      const conversation = await Conversation.findById(req.params.id);
      if (
        String(req.user._id) !== conversation.hostId &&
        String(req.user._id) !== conversation.guestId
      )
        return res.status(401).send("You are not part of the conversation");
      const messages = await Message.find({
        conversationId: conversation._id.toString(),
      });
      markMessagesAsRead(messages, req.user, "queried");
      return res.status(200).json(messages);
    } catch (e) {
      next(e);
    }
  },
);

router.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { conversationIdOrAddressee, message } = req.body as SendMessageReq;
    const Message = messageModel();
    const Conversation = conversationModel();
    let conversation = await Conversation.findById(conversationIdOrAddressee);
    let hostId: User | string = await userModel().findById(
      conversationIdOrAddressee,
    );
    if (!hostId) {
      const company = await companyModel().findById(conversationIdOrAddressee);
      hostId = company?.host?.toString();
    } else hostId = (hostId as User)?._id?.toString();
    if (hostId && typeof hostId === "string") {
      conversation = await Conversation.findOne({
        hostId,
        guestId: String(req.user._id),
      });
    }
    if (!conversation?._id)
      conversation = await new Conversation({
        ...(req.user.type === UserType.host
          ? { hostId: req.user._id }
          : { guestId: req.user._id }),
        ...(req.user.type === UserType.guest
          ? { hostId }
          : { guestId: hostId }),
      }).save();
    console.log("String(req.user._id): ", String(req.user._id));
    console.log("conversation: ", conversation);
    if (
      String(req.user._id) !== conversation.hostId &&
      String(req.user._id) !== conversation.guestId
    )
      return res.status(401).send("You are not part of the conversation");
    const newMessage = new Message({
      ownerId: String(req.user._id),
      conversationId: conversation._id,
      message,
    });

    await newMessage.save();

    return res.status(201).json("Message Sent");
  } catch (e) {
    next(e);
  }
});

export default router;
