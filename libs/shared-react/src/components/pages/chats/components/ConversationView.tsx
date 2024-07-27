import { Box, Grid, IconButton, TextField } from "@mui/material";
import MessageRow from "./MessageRow";
import {
  Dispatch,
  ElementRef,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowBackIosOutlined, Send } from "@mui/icons-material";
import { axiosErrorToaster } from "../../../utils";
import { AxiosInstance } from "axios";
import { ServerContext } from "../../../../context";
import { Conversation, Message, SendMessageReq, TODO } from "@offisito/shared";
import { Btn, PrimaryText, useResponsiveness } from "../../../../";
import { useSubscribe } from "../../../../hooks/useSubscribe";

interface ConversationViewProps {
  conversation: Conversation;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | undefined>>;
  isGuest?: boolean;
}

export const sendMessage = (
  axiosInstance: AxiosInstance | undefined,
  conversationIdOrAddressee: string,
  message: string,
  cb: () => void = () => console.log("no cb :)"),
) => {
  axiosInstance &&
    axiosInstance
      .post<TODO, TODO, SendMessageReq>("api/chat/messages", {
        conversationIdOrAddressee,
        message,
      })
      .finally(() => cb());
};

const ConversationView = ({
  conversation,
  setSelectedConversation,
  isGuest,
}: ConversationViewProps) => {
  const server = useContext(ServerContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<null | Message[]>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const { res } = useSubscribe("api/chat/subscribe");

  const fetchConversationMessages = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        "api/chat/messages/conversationMessages/" + conversation._id,
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
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current && setScrolled(false);
  }, [messages, scrolled, res]);

  const { isMobile } = useResponsiveness(!!isGuest);

  return (
    <>
      {isMobile && (
        <Grid
          width="100%"
          height="50px"
          container
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <IconButton onClick={() => setSelectedConversation(undefined)}>
              <ArrowBackIosOutlined />
            </IconButton>
          </Grid>
          <Grid item></Grid>
          <Grid item></Grid>
        </Grid>
      )}
      <Grid
        container
        width="100%"
        height="calc(100% - 60px)"
        justifyContent="space-between"
      >
        <Grid item width="100%" height="calc(100% - 80px)" overflow="scroll">
          {messages?.map((message, i) => (
            <Box
              key={i}
              ref={i === messages.length - 1 ? messagesEndRef : null}
            >
              <MessageRow key={message._id.toString()} message={message} />
            </Box>
          )) || <PrimaryText padded>Loading Messages...</PrimaryText>}
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
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Type a message..."
            />
          </Grid>
          <Grid item>
            <Btn
              onClick={() => {
                sendMessage(
                  server?.axiosInstance,
                  conversation._id.toString(),
                  message,
                  () => fetchConversationMessages(),
                );
                setMessage("");
              }}
            >
              <Send />
            </Btn>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ConversationView;
