import { Router } from 'express';
import highOrderHandler from '../../../../gbase-b/src/api/routes';
import { AuthenticatedRequest } from '../../../../gbase-b/src/api/middleware';
import {
  InvalidEnumError,
  InvalidInputError,
  UnauthorizedError,
} from '../../../../gbase-b/src/exceptions';
import conversation from '../../schemas/chat/conversation';
import {
  getLastMessageOfConversation,
  getNameOfUser,
  getNumberOfUnreadMessagesInConversation,
} from '../../controllers/chat';
import { TODO } from '../../../../gbase-b/src/types';

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
    const booking = await booking().findById(req.params.id);
    const user =
      req.user.type === 'host'
        ? await User.findById(booking.guest)
        : await User.findById(
            (
              await companyModel().findById(
                (
                  await assetModel().findById(
                    booking ? booking.asset : req.params.id
                  )
                ).companyId
              )
            ).host
          );
    const ress = await conversation().findOne({
      $or: [{ guestId: user._id.toString() }, { hostId: user._id.toString() }],
    });
    if (ress) return res.status(200).json(ress);
    if (!user?._id?.toString()) throw new UnauthorizedError('No partner found');
    return { code: 201, body: user._id.toString() };
  })
);*/

export default router;
