import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Conversation } from "chat-backend";
import { axiosErrorToaster, ServerContext, useSubscribe } from "../";
import { Typography } from "@mui/material";

interface ChatContextProps {
  children: ReactNode;
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
  domain,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
}: ChatContextProps) => {
  const [loading, setLoading] = useState(true);
  const server = useContext(ServerContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { res } = useSubscribe(domain, "api/chat/subscribe");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get("api/chat/conversations");
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
