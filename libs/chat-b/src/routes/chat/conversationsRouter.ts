import { Router } from 'express';
import { AuthenticatedRequest } from 'auth-b';
import { highOrderHandler, TODO, UnauthorizedError } from 'gbase-b';
import { conversation } from '../../schemas/chat';
import {
  getLastMessageOfConversation,
  getNameOfUser,
  getNumberOfUnreadMessagesInConversation
} from '../../controllers/chat';

const router = Router();

router.get(
  '/:quantity?',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!req.user) throw UnauthorizedError();
    let quantity = parseInt(req.params.quantity);
    if (isNaN(quantity) || quantity < 1) {
      quantity = undefined;
    }
    let query = conversation().find({
      $or: [
        { hostId: String(req.user._id) },
        { guestId: String(req.user._id) },
      ],
    });
    if (quantity) {
      query = query.limit(quantity);
    }
    const conversations = await query;
    return {
      code: 200,
      body: await Promise.all(
        conversations.map(async (c: TODO) => ({
          ...c.toObject(),
          lastMessage: await getLastMessageOfConversation(c._id.toString()),
          name: await getNameOfUser(
            req.user.type === 'guest' ? c.hostId : c.guestId
          ),
          unReadNumber: await getNumberOfUnreadMessagesInConversation(
            c._id.toString(),
            req.user
          ),
        }))
      ),
    };
  })
);
/*

router.get(
  '/idByBookingId/:id',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!req.user) throw new UnauthorizedError('Please log in');
    if (!req.params.id) throw new InvalidInputError('No Id received');
    const User = user();
    const bookingF = await booking().findById(req.params.id);
    const userR =
      req.user.type === 'host'
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
    const ress = await conversation().findOne({
      $or: [{ guestId: userR._id.toString() }, { hostId: userR._id.toString() }],
    });
    if (ress) return res.status(200).json(ress);
    if (!userR?._id?.toString()) throw new UnauthorizedError('No partner found');
    return { code: 201, body: userR._id.toString() };
  })
);
*/

export default router;
