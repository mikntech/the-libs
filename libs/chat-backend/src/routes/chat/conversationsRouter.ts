import { Router } from "express";
import { highOrderHandler } from "base-backend";
import { TODO, UnauthorizedError } from "base-shared";
import {
  conversation,
  getLastMessageOfConversation,
  getNameOfUser,
  getNumberOfUnreadMessagesInConversation,
} from "chat-backend";
import { AuthenticatedRequest, User } from "auth-backend";

const router = Router();

router.get(
  "/:quantity?",
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!(req.user as User)) throw new UnauthorizedError("not logged in");
    let quantity: number | undefined = parseInt(req.params["quantity"]);
    if (isNaN(quantity) || quantity < 1) {
      quantity = undefined;
    }
    let query = conversation().find({
      $or: [
        { hostId: String((req.user as User)._id) },
        { guestId: String((req.user as User)._id) },
      ],
    });
    if (quantity) {
      query = query.limit(quantity);
    }
    const conversations = await query;
    return {
      statusCode: 200,
      body: await Promise.all(
        conversations.map(async (c: TODO) => ({
          ...c.toObject(),
          lastMessage: await getLastMessageOfConversation(c._id.toString()),
          name: await getNameOfUser(
            (req.user as TODO).type === "guest" ? c.hostId : c.guestId,
          ),
          unReadNumber: await getNumberOfUnreadMessagesInConversation(
            c._id.toString(),
            req.user as User,
          ),
        })),
      ),
    };
  }) as TODO,
);
/*

router.get(
  '/idByBookingId/:id',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!(req.user as User)) throw new UnauthorizedError('Please log in');
    if (!req.params.id) throw new InvalidInputError('No Id received');
    const User = user(false, false,false) as TODO;
    const bookingF = await booking().findById(req.params.id);
    const userR =
      (req.user as User).type === 'host'
        ? await User.findById(bookingF.guest)
        : await User.findById(
            (
              await companyModel().findById(
                (
                  await assetModel().findById(
                    bookingF ? bookingF.asset : req.params.id
                  )
                ).companyId
              )
            ).host
          );
    const results = await conversation().findOne({
      $or: [{ guestId: userR._id.toString() }, { hostId: userR._id.toString() }],
    });
    if (results) return res.status(200).json(results);
    if (!userR?._id?.toString()) throw new UnauthorizedError('No partner found');
    return { statusCode: 201, body: userR._id.toString() };
  })
);
*/

export default router;
