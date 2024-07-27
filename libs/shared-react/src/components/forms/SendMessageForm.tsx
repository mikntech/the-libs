import { Grid, Modal } from "@mui/material";
import { useContext, useState } from "react";
import {
  Btn,
  CloseButton,
  PrimaryText,
  renderTextField,
  sendMessage,
  ServerContext,
} from "@offisito/shared-react";
import { useNavigate } from "react-router-dom";
import { UserType } from "@offisito/shared";

interface SendMessageFormProps {
  id: string;
  close: () => void;
  spaceId?: string;
  amIaGuest?: boolean;
}

const SendMessageForm = ({
  id,
  close,
  spaceId,
  amIaGuest,
}: SendMessageFormProps) => {
  const [message, setMessage] = useState<{ msg: string }>({ msg: "" });
  const server = useContext(ServerContext);
  const navigate = useNavigate();

  return (
    <Modal open>
      <Grid
        height="80%"
        width="80%"
        marginLeft="10%"
        marginTop="5%"
        padding="2%"
        overflow="scroll"
        item
        container
        direction="column"
        rowSpacing={4}
        alignItems="center"
        wrap="nowrap"
        bgcolor={(theme) => theme.palette.background.default}
      >
        <Grid item>
          <CloseButton onClick={close} />
        </Grid>
        <Grid item>
          <PrimaryText variant="h5">
            Send a message to the {amIaGuest ? UserType.host : UserType.guest}
          </PrimaryText>
        </Grid>
        <Grid item>
          {renderTextField(
            message,
            (name, value) => setMessage({ msg: value as string }),
            ["msg"],
            { multiline: true, label: "Message:" },
          )}
        </Grid>
        <Grid item>
          <Btn
            onClick={() =>
              server &&
              sendMessage(server.axiosInstance, id, message.msg, () =>
                amIaGuest ? navigate("/chats?chatId=" + spaceId) : close(),
              )
            }
          >
            Send
          </Btn>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default SendMessageForm;
