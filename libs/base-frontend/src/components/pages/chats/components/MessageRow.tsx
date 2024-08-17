import { useContext } from 'react';
import { styled, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { AuthContext } from '../../../../';
import { Message } from '@chat-backend';

const Container = styled(Box)({
  width: '100%',
});

interface BalloonProps {
  isMe?: 'yes' | 'no';
  read?: 'yes' | 'no';
}

const Balloon = styled(Typography, {
  shouldForwardProp: (prop) =>
    prop !== 'isAi' && prop !== 'isMe' && prop !== 'read',
})<BalloonProps>(({ theme, isMe, read }) => ({
  backgroundColor:
    isMe === 'yes' ? theme.palette.primary.main : theme.palette.secondary.main,
  color:
    isMe === 'yes'
      ? theme.palette.primary.contrastText
      : theme.palette.primary.contrastText,
  borderRadius: '20px',
  padding: '10px 16px',
  maxWidth: '80%', // Limits the width, but allows height to expand
  wordWrap: 'break-word', // Ensures text wraps within the balloon
  alignSelf: isMe === 'yes' ? 'flex-end' : 'flex-start',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  margin: '5px 0',
  flex: '0 0 auto',
  '&:after': {
    content: read === 'yes' ? '"\\2713\\2713"' : '""',
    display: read === 'yes' ? 'block' : 'none',
    fontSize: '12px',
    marginTop: '4px',
    color: read === 'yes' ? '' : 'transparent',
    textAlign: 'right',
  },
}));

interface MessageRowProps {
  message: Message;
  tenum: { admin: string };
}

const MessageRow = ({ message, tenum }: MessageRowProps) => {
  const { user } = useContext(AuthContext);

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column-reverse' }}>
        {String(user?._id) === message.ownerId && (
          <Balloon read={message.whenQueried ? 'yes' : 'no'} isMe="yes">
            {message.message}
          </Balloon>
        )}
        {String(user?._id) !== message.ownerId && (
          <Balloon>{message.message}</Balloon>
        )}
      </Box>
    </Container>
  );
};

export default MessageRow;
