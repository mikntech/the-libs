import { Router } from "express";
import { highOrderHandler, UnauthorizedError } from 'base-backend';
import { AuthenticatedRequest, User, user } from 'auth-backend';
import { markMessagesAsRead } from '../../controllers/chat';
import { conversation, message } from '../../schemas/chat';

const router = Router();

router.get(
  "/conversationMessages/:id",
  highOrderHandler(
  async (req: AuthenticatedRequest) => {
      const Message = message();
      const Conversation = conversation();
      const conversationR = await Conversation.findById(req.params.id);
      if (
        String(req.user._id) !== conversationR.hostId &&
        String(req.user._id) !== conversationR.guestId
      )
        throw new UnauthorizedError("You are not part of the conversation");
      const messages = await Message.find({
        conversationRId: conversation._id.toString(),
      });
      await markMessagesAsRead(messages, req.user, "queried");
      return { code: 200, body:(messages)};
  },
));

router.post("/",      highOrderHandler(  async (req: AuthenticatedRequest) => {
    const { conversationIdOrAddressee, message } = req.body;
    const Message = message();
    const Conversation = conversation();
    let conversationR = await Conversation.findById(conversationIdOrAddressee);
    let hostId: User | string = await user().findById(
      conversationIdOrAddressee,
    );
    if (!hostId) {
      const companyF = await company().findById(conversationIdOrAddressee);
      hostId = companyF?.host?.toString();
    } else hostId = (hostId as User)?._id?.toString();
    if (hostId) {
      conversationR = await Conversation.findOne({
        hostId,
        guestId: String(req.user._id),
      });
    }
    if (!conversationR?._id)
      conversationR = await new Conversation({
        ...(req.user.type === UserType.host
          ? { hostId: req.user._id }
          : { guestId: req.user._id }),
        ...(req.user.type === UserType.guest
          ? { hostId }
          : { guestId: hostId }),
      }).save();
    console.log("String(req.user._id): ", String(req.user._id));
    console.log("conversation: ", conversationR);
    if (
      String(req.user._id) !== conversationR.hostId &&
      String(req.user._id) !== conversationR.guestId
    )
     throw new UnauthorizedError("You are not part of the conversation");
    const newMessage = new Message({
      ownerId: String(req.user._id),
      conversationId: conversationR._id,
      message,
    });

    await newMessage.save();

    return {code :201, body:("Message Sent")};

}));

export default router;
