import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Conversation } from '@the-libs/chat-shared';
import { Typography } from '@mui/material';
import {
  axiosErrorToaster,
  ServerContext,
  useSubscribe,
} from '@the-libs/base-frontend';

interface ChatContextProps {
  children: ReactNode;
  VITE_STAGING_ENV: string;
  domain: string;
  MainMessage: (props: { text: string }) => ReactNode;
}

export const ChatContext = createContext<{
  conversations: Conversation[];
  totalUnReadCounter: number;
}>({
  conversations: [],
  totalUnReadCounter: 0,
});

export const ChatContextProvider = ({
  children,
  VITE_STAGING_ENV,
  domain,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
}: ChatContextProps) => {
  const [loading, setLoading] = useState(true);
  const server = useContext(ServerContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { res } = useSubscribe(VITE_STAGING_ENV, domain, 'api/chat/subscribe');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get('api/chat/conversations');
      res?.data && setConversations(res?.data);
      setLoading(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance]);

  useEffect(() => {
    fetchConversations().then();
  }, [fetchConversations, res]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        totalUnReadCounter: conversations.reduce(
          (accumulator, { unReadNumber }) => accumulator + (unReadNumber || 0),
          0,
        ),
      }}
    >
      {loading ? <MainMessage text="Loading you chats..." /> : children}
    </ChatContext.Provider>
  );
};
