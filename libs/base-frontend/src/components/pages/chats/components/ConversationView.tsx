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
} from 'react';
import { ArrowBackIosOutlined, Send } from '@mui/icons-material';
import { AxiosInstance } from 'axios';
import { ServerContext } from '../../../../context';
import { Conversation, Message } from '@chat-backend';
import { TODO } from '@base-shared';
import { useResponsiveness, useSubscribe } from '../../../../hooks';
import { axiosErrorToaster } from '../../../../utils';
import { extactNameInitials } from '../../../../utils/index';

interface ConversationViewProps {
  conversation: Conversation;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | undefined>>;
  domain: string;
  tenum: { admin: string };
  isMobillized?: boolean;
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

const ConversationView = ({
  conversation,
  setSelectedConversation,
  isMobillized,
  domain,
  tenum,
  PrimaryText = Typography,
  Btn = Button,
}: ConversationViewProps) => {
  const server = useContext(ServerContext);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<null | Message[]>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const { res } = useSubscribe(domain, 'api/chat/subscribe');

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
  const handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };
  const handleSendMessage = () => {
    sendMessage(
      server?.axiosInstance,
      conversation._id?.toString() || '',
      message,
      fetchConversationMessages
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

  const { isMobile } = useResponsiveness(!!isMobillized);

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
        <Grid item>
          <IconButton onClick={() => setSelectedConversation(undefined)}>
            <ArrowBackIosOutlined />
          </IconButton>
        </Grid>
        <Grid item>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar>{extactNameInitials(conversation.name)} </Avatar>
            <Typography color="primary.contrastText" fontWeight={700}>
              {conversation.name}
            </Typography>
          </Box>
        </Grid>
        <Grid item></Grid>
      </Grid>
      <Grid
        container
        width="100%"
        height="calc(100% - 60px)"
        justifyContent="space-between"
        marginTop={"3rem"}
      >
        <Grid item width="100%" height="calc(100% - 80px)" overflow="scroll">
          {renderMessages()}
        </Grid>
        <Grid
          item
          container
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          height="80px"
        >
          <Grid item width="80%">
            <TextField onKeyDown={handleKeyDown}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Type a message..."
            />
          </Grid>
          <Grid item>
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
