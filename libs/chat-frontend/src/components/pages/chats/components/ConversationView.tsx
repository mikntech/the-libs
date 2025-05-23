import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Avatar,
} from '@mui/material';
import MessageRow from './MessageRow';
import {
  Dispatch,
  ElementRef,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import { ArrowBackIosOutlined, Send } from '@mui/icons-material';
import { AxiosInstance } from 'axios';
import { Conversation, Message } from '@the-libs/chat-shared';
import { TODO } from '@the-libs/base-shared';
import {
  axiosErrorToaster,
  extactNameInitials,
  ServerContext,
  useSubscribe,
} from '@the-libs/base-frontend';

interface ConversationViewProps<
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
> {
  VITE_STAGING_ENV: string;
  conversation: Conversation<Mediator, Side1Name, Side2Name, PairName>;
  setSelectedConversation: Dispatch<
    SetStateAction<
      Conversation<Mediator, Side1Name, Side2Name, PairName> | undefined
    >
  >;
  domain: string;
  tenum: { admin: string };
  PrimaryText?: FC<TODO>;
  Btn?: FC<TODO>;
}

export const sendMessage = (
  axiosInstance: AxiosInstance | undefined,
  conversationIdOrAddressee: string,
  message: string,
  cb: () => void = () => console.log('no cb :)'),
) => {
  axiosInstance &&
    axiosInstance
      .post('api/chat/messages', {
        conversationIdOrAddressee,
        message,
      })
      .finally(() => cb());
};

export const ConversationView = <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>({
  VITE_STAGING_ENV,
  conversation,
  setSelectedConversation,
  domain,
  tenum,
  PrimaryText = Typography,
  Btn = Button,
}: ConversationViewProps<Mediator, Side1Name, Side2Name, PairName>) => {
  const server = useContext(ServerContext);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<null | Message[]>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const { res } = useSubscribe(VITE_STAGING_ENV, domain, 'api/chat/subscribe');

  const fetchConversationMessages = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        'api/chat/messages/conversationMessages/' + conversation._id,
      );
      res?.data && setMessages(res.data);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance, conversation._id]);

  useEffect(() => {
    fetchConversationMessages().then();
  }, [fetchConversationMessages, res]);

  const messagesEndRef = useRef<ElementRef<typeof TextField>>(null);

  useEffect(() => {
    messages &&
      messages.length > 0 &&
      !scrolled &&
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    messagesEndRef.current && setScrolled(false);
  }, [messages, scrolled, res]);

  const formatDate = (date: string): string => {
    return new Date(date)
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
      .toUpperCase();
  };
  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };
  const handleSendMessage = () => {
    sendMessage(
      server?.axiosInstance,
      conversation._id?.toString() || '',
      message,
      fetchConversationMessages,
    );
    setMessage('');
  };

  const renderMessages = () => {
    let lastMessageDate: string | null = null;

    return (
      messages?.map((message, i) => {
        const formattedDate = formatDate(message.createdAt as any);
        const shouldRenderDate = lastMessageDate !== formattedDate;

        if (shouldRenderDate) {
          lastMessageDate = formattedDate;
        }

        return (
          <Box key={i} ref={i === messages.length - 1 ? messagesEndRef : null}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: '4px' }}>
              {shouldRenderDate && (
                <Typography color="secondary.contrastText">
                  {formattedDate}
                </Typography>
              )}
            </Box>
            <MessageRow
              key={message._id?.toString()}
              message={message}
              tenum={tenum}
            />
          </Box>
        );
      }) || <PrimaryText padded>Loading Messages...</PrimaryText>
    );
  };

  return (
    <>
      <Grid
        width="100%"
        height="50px"
        container
        justifyContent="space-between"
        alignItems="center"
        marginBottom={4}
        position="fixed"
        boxShadow={'0 6px 3px rgba(0, 0, 0, 0.2)'}
      >
        <Grid>
          <IconButton onClick={() => setSelectedConversation(undefined)}>
            <ArrowBackIosOutlined />
          </IconButton>
        </Grid>
        <Grid>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar>{extactNameInitials(conversation.title)} </Avatar>
            <Typography color="primary.contrastText" fontWeight={700}>
              {conversation.title}
            </Typography>
          </Box>
        </Grid>
        <Grid></Grid>
      </Grid>
      <Grid
        container
        width="100%"
        height="calc(100% - 60px)"
        justifyContent="space-between"
        marginTop={'3rem'}
      >
        <Grid width="100%" height="calc(100% - 80px)" overflow="scroll">
          {renderMessages()}
        </Grid>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          height="80px"
        >
          <Grid width="80%">
            <TextField
              onKeyDown={handleKeyDown}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Type a message..."
            />
          </Grid>
          <Grid>
            <Btn onClick={handleSendMessage}>
              <Send />
            </Btn>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ConversationView;
