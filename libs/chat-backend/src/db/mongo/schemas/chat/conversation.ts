import { findDocs, getModel } from '@the-libs/mongo-backend';
import {
  DBConversation,
  CachedConversation,
  Message,
} from '@the-libs/chat-shared';
import { TODO } from '@the-libs/base-shared';
import { message } from './message';

const REF_OR_ID = 'RefOrId';

export const conversation = async <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>(
  optional: { mediator?: boolean } & (
    | {
        side1Name: string;
        side2Name: string;
      }
    | { pairName: string }
  ),
) => {
  const optionalSchema: TODO = {};
  if ('side1Name' in optional)
    optionalSchema[optional.side1Name + REF_OR_ID] = {
      type: String,
      required: true,
    };
  if ('side2Name' in optional)
    optionalSchema[optional.side2Name + REF_OR_ID] = {
      type: String,
      required: true,
    };
  if ('pairName' in optional)
    optionalSchema[optional.pairName + REF_OR_ID] = {
      type: String,
      required: true,
    };
  if ('mediator' in optional)
    optionalSchema['mediator' + REF_OR_ID] = { type: String, required: true };
  return getModel<
    DBConversation<Mediator, Side1Name, Side2Name, PairName>,
    CachedConversation
  >(
    'conversation',
    {
      ...optionalSchema,
      title: { type: String },
      hiddenFor: [{ type: String }],
    },
    {
      computedFields: {
        lastMessage: {
          compute: async (_id) =>
            findDocs<false, Message>(
              await message(),
              (await message())
                .findOne({ conversation: _id })
                .sort({ createdAt: -1 })
                .exec(),
            ),
          invalidate: async (id, coll, fullDoc) =>
            coll === 'messages' &&
            String((fullDoc as unknown as Message)?.conversation) === id,
        },
      },
    },
  );
};
