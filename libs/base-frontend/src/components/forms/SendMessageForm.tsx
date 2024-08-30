import { Button, Grid, Modal, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  renderTextField,
  sendMessage,
  ServerContext,
} from '@the-libs/base-frontend';
import { TODO } from '@the-libs/base-shared';

interface SendMessageFormProps {
  id: string;
  close: () => void;
  spaceId?: string;
  amIaGuest?: boolean;
  tenum: { guest: string; host: string };
  customComponents?: {
    Btn?: TODO;
    PrimaryText?: TODO;
    CloseButton?: TODO;
  };
}

const SendMessageForm = ({
  id,
  close,
  spaceId,
  amIaGuest,
  tenum,
  customComponents = {
    Btn: Button,
    PrimaryText: Typography,
    CloseButton: Button,
  },
}: SendMessageFormProps) => {
  if (!customComponents.Btn) customComponents.Btn = Button;
  if (!customComponents.PrimaryText) customComponents.PrimaryText = Typography;
  if (!customComponents.CloseButton) customComponents.CloseButton = Button;

  const [message, setMessage] = useState<{ msg: string }>({ msg: '' });
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
          <customComponents.CloseButton onClick={close} />
        </Grid>
        <Grid item>
          <customComponents.PrimaryText variant="h5">
            Send a message to the {amIaGuest ? tenum.host : tenum.guest}
          </customComponents.PrimaryText>
        </Grid>
        <Grid item>
          {renderTextField(
            message,
            (_, value) => setMessage({ msg: value as string }),
            ['msg'],
            { multiline: true, label: 'Message:' },
          )}
        </Grid>
        <Grid item>
          <customComponents.Btn
            onClick={() =>
              server &&
              sendMessage(server.axiosInstance, id, message.msg, () =>
                amIaGuest ? navigate('/chats?chatId=' + spaceId) : close(),
              )
            }
          >
            Send
          </customComponents.Btn>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default SendMessageForm;
