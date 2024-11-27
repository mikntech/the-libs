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
import { TODO } from '@the-libs/base-shared';

interface ChatContextProps {
  children: ReactNode;
  VITE_STAGING_ENV: string;
  domain: string;
  MainMessage: (props: { text: string }) => ReactNode;
  unReadNumbers: number[];
}

export const ChatContextCreator = <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>() =>
  createContext<{
    conversations: Conversation<Mediator, Side1Name, Side2Name, PairName>[];
    unReadNumbers: number[];
    totalUnReadCounter: number;
  }>({
    conversations: [],
    unReadNumbers: [],
    totalUnReadCounter: 0,
  });

export const ChatContextProvider = <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>({
  children,
  VITE_STAGING_ENV,
  domain,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
}: ChatContextProps) => {
  const [loading, setLoading] = useState(true);
  const server = useContext(ServerContext);
  const [conversations, setConversations] = useState<
    Conversation<Mediator, Side1Name, Side2Name, PairName>[]
  >([]);
  const [unReadNumbers, setUnReadNumbers] = useState<number[]>([]);

  const { res } = useSubscribe(VITE_STAGING_ENV, domain, 'api/chat/subscribe');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get('api/chat/conversations');
      const conversations:
        | Conversation<Mediator, Side1Name, Side2Name, PairName>
        | undefined = res?.data;
      conversations && setConversations(conversations as TODO);
      conversations &&
        setUnReadNumbers(
          await Promise.all(
            (conversations as TODO).map(
              async ({
                _id,
              }: Conversation<Mediator, Side1Name, Side2Name, PairName>) => {
                try {
                  const cNRes = await server?.axiosInstance.get(
                    'api/chat/unReadNo/' + String(_id),
                  );
                  return cNRes?.data;
                } catch {
                  return 0;
                }
              },
            ),
          ),
        );
      setLoading(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance]);

  useEffect(() => {
    fetchConversations().then();
  }, [fetchConversations, res]);

  const ChatContext = ChatContextCreator();

  return (
    <ChatContext.Provider
      value={{
        conversations,
        unReadNumbers,
        totalUnReadCounter: unReadNumbers.reduce(
          (accumulator, unReadNumber) => accumulator + (unReadNumber || 0),
          0,
        ),
      }}
    >
      {loading ? <MainMessage text="Loading you chats..." /> : children}
    </ChatContext.Provider>
  );
};
