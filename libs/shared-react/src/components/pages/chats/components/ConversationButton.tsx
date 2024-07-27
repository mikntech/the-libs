import { Avatar, Badge, Grid } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { PrimaryText, useIsNight } from "../../../../";
import { Conversation } from "@offisito/shared";

interface ConversationButtonProps {
  conversation: Conversation;
  isTheSelectedConversation: boolean;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | undefined>>;
  wide: boolean;
}

export const ConversationButton = ({
  conversation,
  isTheSelectedConversation,
  setSelectedConversation,
  wide,
}: ConversationButtonProps) => {
  const isNight = useIsNight();
  const MAX_NAME_LENGTH = conversation.unReadNumber ? 20 : 22;
  const MAX_LAST_MESSAGE_LENGTH = 18;

  const avatar = <Avatar />;

  return (
    <Grid
      container
      onClick={() => setSelectedConversation(conversation)}
      sx={{ cursor: "pointer" }}
      wrap="nowrap"
      width={isTheSelectedConversation ? "calc(100% - 0.1vw)" : "100%"}
      border={
        isTheSelectedConversation
          ? `0.2vw solid ${isNight ? "white" : "black"}`
          : ""
      }
      justifyContent="center"
      alignItems="center"
      columnSpacing={1}
      marginLeft={isTheSelectedConversation ? "0.1vw" : "0vw"}
    >
      <Grid item>
        {!wide && conversation.unReadNumber !== 0 ? (
          <Badge badgeContent={conversation.unReadNumber} color="error">
            {avatar}
          </Badge>
        ) : (
          avatar
        )}
      </Grid>
      {wide ? (
        <Grid
          item
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          rowSpacing={1}
        >
          {conversation.name && (
            <Grid
              item
              container
              justifyContent="space-between"
              alignItems="center"
              columnSpacing={1}
            >
              <Grid item>
                <PrimaryText>
                  {conversation.name.length > MAX_NAME_LENGTH
                    ? conversation.name.substring(0, MAX_NAME_LENGTH - 3) +
                      "..."
                    : conversation.name}
                </PrimaryText>
              </Grid>
              {conversation.unReadNumber != 0 && (
                <Grid item>
                  <PrimaryText
                    paddingLeft="3px"
                    paddingRight="3px"
                    bgcolor="red"
                    borderRadius="80px"
                    color="white"
                  >
                    {conversation.unReadNumber}
                  </PrimaryText>
                </Grid>
              )}
              <Grid item>
                <PrimaryText> </PrimaryText>
              </Grid>
            </Grid>
          )}
          {conversation.lastMessage && (
            <Grid
              item
              container
              justifyContent="space-between"
              alignItems="center"
              columnSpacing={1}
            >
              <Grid item>
                <PrimaryText>
                  {conversation.lastMessage.message.length >
                  MAX_LAST_MESSAGE_LENGTH
                    ? conversation.lastMessage.message.substring(
                        0,
                        MAX_LAST_MESSAGE_LENGTH - 3,
                      ) + "..."
                    : conversation.lastMessage.message}
                </PrimaryText>
              </Grid>
              <Grid item>
                <PrimaryText>
                  {`${new Date(conversation.lastMessage.createdAt).getHours().toString().padStart(2, "0")}:${new Date(conversation.lastMessage.createdAt).getMinutes().toString().padStart(2, "0")}`}
                </PrimaryText>
              </Grid>
              <Grid item>
                <PrimaryText></PrimaryText>
              </Grid>
            </Grid>
          )}
        </Grid>
      ) : (
        <Grid item>
          <PrimaryText></PrimaryText>
        </Grid>
      )}
    </Grid>
  );
};
