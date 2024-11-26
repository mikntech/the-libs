import { Button, Grid2, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ConversationView from './components/ConversationView';
import { ChatContext, ConversationButton } from '../../../';
import { useLocation } from 'react-router-dom';
import SendMessageForm from '../../forms/SendMessageForm';
import { TODO } from '@the-libs/base-shared';
import { Conversation } from '@the-libs/chat-shared';
import { ServerContext, useResponsiveness } from '@the-libs/base-frontend';

interface ChatsPageProps {
  VITE_STAGING_ENV: string;
  isMobillized?: boolean;
  PrimaryText?: TODO;
  tenum: { guest: string; host: string; admin: string };
  domain: string;
  disableDarkMode?: boolean;
  customComponents?: {
    Btn?: TODO;
    PrimaryText?: TODO;
    CloseButton?: TODO;
  };
}

export const ChatsPage = ({
  VITE_STAGING_ENV,
  isMobillized,
  PrimaryText = Typography,
  tenum,
  domain,
  disableDarkMode,
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

  const { isMobile } = useResponsiveness(!!isMobillized);

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
    <Grid2
      width={'auto'}
      height="100%"
      marginX="10px"
      container
      wrap="nowrap"
      flexDirection={'column'}
    >
      {!selectedConversation && (
        <Typography
          color="primary.contrastText"
          variant="h1"
          marginTop={'20px'}
          marginBottom={'10px'}
        >
          Inbox
        </Typography>
      )}

      {!selectedConversation && (
        <Grid2
          // width={wide ? '100%' : totalUnReadCounter !== 0 ? '70px' : '50px'}
          height="100%"
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
              <Grid2 key={conversation._id?.toString()}>
                <br />
                <ConversationButton
                  key={conversation._id?.toString()}
                  wide={wide}
                  conversation={conversation}
                  isTheSelectedConversation={false}
                  setSelectedConversation={setSelectedConversation}
                  disableDarkMode
                />
              </Grid2>
            ))
          ) : (
            <PrimaryText padded fontSize="80%">
              You don't have conversations yet
            </PrimaryText>
          )}
        </Grid2>
      )}
      <Grid2
        height="100%"
        overflow="scroll"
        flexGrow={1}
        onClick={() => setOpen(false)}
      >
        {selectedConversation && (
          <ConversationView
            VITE_STAGING_ENV={VITE_STAGING_ENV}
            conversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            domain={domain}
            tenum={tenum}
          />
        )}
      </Grid2>
    </Grid2>
  );
};
