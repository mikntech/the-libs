import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Conversation } from "@offisito/shared";
import { axiosErrorToaster, MainMessage, ServerContext } from "../";
import { useSubscribe } from "../hooks/useSubscribe";

interface ChatContextProps {
  children: ReactNode;
}

export const ChatContext = createContext<{
  conversations: Conversation[];
  totalUnReadCounter: number;
}>({
  conversations: [],
  totalUnReadCounter: 0,
});

export const ChatContextProvider = ({ children }: ChatContextProps) => {
  const [loading, setLoading] = useState(true);
  const server = useContext(ServerContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { res } = useSubscribe("api/chat/subscribe");

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
