import { Button, Grid, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ConversationView from './components/ConversationView';
import { ChatContextCreator, ConversationButton } from '../../../';
import { useLocation } from 'react-router-dom';
import SendMessageForm from '../../forms/SendMessageForm';
import { TODO } from '@the-libs/base-shared';
import { Conversation } from '@the-libs/chat-shared';
import { ServerContext } from '@the-libs/base-frontend';

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

export const ChatsPage = <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>({
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
    useState<Conversation<Mediator, Side1Name, Side2Name, PairName>>();
  const { conversations, unReadNumbers } =
    useContext(ChatContextCreator<Mediator, Side1Name, Side2Name, PairName>());

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
    <Grid
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
        <Grid
          // width={wide ? '100%' : totalUnReadCounter !== 0 ? '70px' : '50px'}
          height="100%"
          container
          direction="column"
          rowSpacing={0}
          overflow="scroll"
          wrap="nowrap"
          bgcolor={(theme) => theme.palette.background.default}
          sx={{ flexShrink: 0 }}
        >
          {conversations.length > 0 ? (
            conversations.map((conversation, i) => (
              <Grid key={conversation._id?.toString()}>
                <br />
                <ConversationButton
                  key={conversation._id?.toString()}
                  wide={wide}
                  conversation={conversation}
                  isTheSelectedConversation={false}
                  setSelectedConversation={setSelectedConversation}
                  unReadNumber={unReadNumbers[i]}
                  disableDarkMode
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
      <Grid height="100%" overflow="scroll" flexGrow={1}>
        {selectedConversation && (
          <ConversationView
            VITE_STAGING_ENV={VITE_STAGING_ENV}
            conversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            domain={domain}
            tenum={tenum}
          />
        )}
      </Grid>
    </Grid>
  );
};
