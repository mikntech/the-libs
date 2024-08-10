import { Button, Grid, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ConversationView from './components/ConversationView';
import {
  ChatContext,
  ConversationButton,
  ServerContext,
  useResponsiveness,
} from '../../../';
import { useLocation } from 'react-router-dom';
import SendMessageForm from '../../forms/SendMessageForm';
import { TODO } from '@base-shared';
import { Conversation } from '@chat-backend';

interface ChatsPageProps {
  isGuest?: boolean;
  PrimaryText?: TODO;
  tenum: { guest: string; host: string; admin: string };
  domain: string;
  customComponents?: {
    Btn?: TODO;
    PrimaryText?: TODO;
    CloseButton?: TODO;
  };
}

export const ChatsPage = ({
  isGuest,
  PrimaryText = Typography,
  tenum,
  domain,
  customComponents = {
    Btn: Button,
    PrimaryText: Typography,
    CloseButton: Button,
  },
}: ChatsPageProps) => {
  if (!customComponents.Btn) customComponents.Btn = Button;
  if (!customComponents.PrimaryText) customComponents.PrimaryText = Typography;
  if (!customComponents.CloseButton) customComponents.CloseButton = Button;

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const { conversations, totalUnReadCounter } = useContext(ChatContext);

  const { isMobile } = useResponsiveness(!!isGuest);

  const [open, setOpen] = useState<boolean>(true);

  const [sendMessage, setSendMessage] = useState(false);
  const [newId, setNewId] = useState('');

  const wide = true; // open || !isMobile;

  const useQuery = () => {
    const location = useLocation();
    return useMemo(
      () => new URLSearchParams(location.search),
      [location.search],
    );
  };

  const server = useContext(ServerContext);

  const query = useQuery();

  const getConverationIDbyBookingId = useCallback(
    async (id: string) => {
      const res = await server?.axiosInstance.get(
        'api/chat/conversations/idByBookingId/' + id,
      );
      if (typeof res?.data === 'string') {
        setSendMessage(true);
        setNewId(res.data);
      } else
        return res?.data._id?.toString() && setSelectedConversation(res.data);
    },
    [server?.axiosInstance],
  );

  useEffect(() => {
    const id = query.get('chatId');
    if (id) {
      getConverationIDbyBookingId(id);
    } else setSendMessage(false);
  }, [query, getConverationIDbyBookingId]);

  return sendMessage ? (
    <SendMessageForm
      id={newId}
      close={() => setSendMessage(false)}
      tenum={tenum}
      customComponents={customComponents}
    />
  ) : (
    <Grid height="100%" container wrap="nowrap">
      {!(selectedConversation && isMobile) && (
        <Grid
          width={wide ? '250px' : totalUnReadCounter !== 0 ? '70px' : '50px'}
          height="100%"
          item
          container
          direction="column"
          rowSpacing={0}
          overflow="scroll"
          wrap="nowrap"
          bgcolor={(theme) => theme.palette.background.default}
          sx={{ flexShrink: 0 }}
          onClick={() => setOpen(true)}
        >
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Grid key={conversation._id?.toString()} item>
                <br />
                <ConversationButton
                  key={conversation._id?.toString()}
                  wide={wide}
                  conversation={conversation}
                  isTheSelectedConversation={
                    conversation._id === selectedConversation?._id
                  }
                  setSelectedConversation={setSelectedConversation}
                />
              </Grid>
            ))
          ) : (
            <PrimaryText padded fontSize="80%">
              You don't have conversations yet
            </PrimaryText>
          )}
        </Grid>
      )}
      <Grid
        height="100%"
        item
        overflow="scroll"
        flexGrow={1}
        onClick={() => setOpen(false)}
      >
        {selectedConversation && (
          <ConversationView
            conversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            isGuest={isGuest}
            domain={domain}
            tenum={tenum}
          />
        )}
      </Grid>
    </Grid>
  );
};
