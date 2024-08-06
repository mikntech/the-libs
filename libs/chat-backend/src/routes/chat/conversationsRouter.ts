import { Router } from 'express';
import { highOrderHandler } from 'base-backend';
import { InvalidInputError, TODO, UnauthorizedError } from 'base-shared';
import {
  conversation,
  getLastMessageOfConversation,
  getNameOfUser,
  getNumberOfUnreadMessagesInConversation,
} from 'chat-backend';
import { AuthenticatedRequest, user, User } from 'auth-backend';
import { UserType } from 'offisito-backend';
import bookingModel from '../../schemas/bookings/bookingModel';
import companyModel from '../../schemas/assets/companyModel';
import assetModel from '../../schemas/assets/assetModel';

const router = Router();

router.get(
  '/:quantity?',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    if (!(req.user as User)) throw new UnauthorizedError('not logged in');
    let quantity: number | undefined = parseInt(req.params['quantity']);
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
            (req.user as TODO).type === 'guest' ? c.hostId : c.guestId,
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

router.get(
  '/idByBookingId/:id',
  highOrderHandler((async (req: AuthenticatedRequest) => {
    if (!(req.user as User)) throw new UnauthorizedError('Please log in');
    if (!req.params['id']) throw new InvalidInputError('No Id received');
    const User = user<true>(true, true, false);
    const booking = await bookingModel().findById(req.params['id']);
    const userR =
      (req.user as User).userType === UserType.host
        ? await User.findById(booking?.guest)
        : await User.findById(
            (
              await companyModel().findById(
                (
                  await assetModel().findById(
                    booking ? booking.asset : req.params['id'],
                  )
                )?.companyId,
              )
            )?.host,
          );
    const results = await conversation().findOne({
      $or: [
        { guestId: userR?._id.toString() },
        { hostId: userR?._id.toString() },
      ],
    });

    if (results) return { statusCode: 200, body: results };
    if (!userR?._id?.toString())
      throw new UnauthorizedError('No partner found');
    return { statusCode: 201, body: userR._id.toString() };
  }) as TODO),
);

export default router;
