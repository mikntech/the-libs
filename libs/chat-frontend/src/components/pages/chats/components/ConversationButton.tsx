import {
  Avatar,
  Badge,
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { TODO } from '@the-libs/base-shared';
import { Conversation } from '@the-libs/chat-shared';
import { KeyboardArrowRight } from '@mui/icons-material';
import { extactNameInitials, useIsNight } from '@the-libs/base-frontend';

interface ConversationButtonProps<
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
> {
  conversation: Conversation<Mediator, Side1Name, Side2Name, PairName>;
  isTheSelectedConversation: boolean;
  setSelectedConversation: Dispatch<
    SetStateAction<
      Conversation<Mediator, Side1Name, Side2Name, PairName> | undefined
    >
  >;
  wide: boolean;
  PrimaryText?: TODO;
  disableDarkMode?: boolean;
  unReadNumber: number;
}

export const ConversationButton = <
  Mediator extends boolean,
  Side1Name extends string,
  Side2Name extends string,
  PairName extends string,
>({
  conversation,
  unReadNumber,
  isTheSelectedConversation,
  setSelectedConversation,
  wide,
  disableDarkMode,
}: ConversationButtonProps<Mediator, Side1Name, Side2Name, PairName>) => {
  const isNight = useIsNight(disableDarkMode);
  const MAX_NAME_LENGTH = 18;
  const MAX_LAST_MESSAGE_LENGTH = 32;

  const randomHexNumberGenerator = () => {
    //const color = Math.floor(Math.random() * 16777215).toString(16);
    const color = '555555';
    return '#' + color;
  };
  const truncateString = (
    originalString: string,
    maxLength: number,
  ): string => {
    return originalString.length > maxLength
      ? originalString.slice(0, maxLength - 3) + '...'
      : originalString;
  };

  const formatHourAndMinutes = (date: Date): string => {
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minutes}`;
  };

  return (
    <Card
      component="div"
      onClick={() => setSelectedConversation(conversation)}
      sx={{
        borderRadius: 0,
        marginLeft: isTheSelectedConversation ? '0.1vw' : '0vw',
        borderBottom: 2,
        borderColor: '#CAC4D0',
        boxShadow: 0,
        cursor: 'pointer',
        transition: 'background-color 0.3s ease', // Smooth transition for hover effect
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add shadow on hover
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          px: '0px',
          py: '12px',
          '&:last-child': { paddingBottom: '12px' },
        }}
      >
        <Box>
          {unReadNumber !== 0 ? (
            <Badge badgeContent={unReadNumber} color="error">
              <Avatar sx={{ bgcolor: randomHexNumberGenerator() }}>
                {extactNameInitials(conversation.title)}{' '}
              </Avatar>
            </Badge>
          ) : (
            <Avatar sx={{ bgcolor: randomHexNumberGenerator() }}>
              {extactNameInitials(conversation.title)}{' '}
            </Avatar>
          )}
        </Box>

        <Box sx={{ marginLeft: '15px', marginTop: '-5px' }}>
          <Typography>
            {truncateString(conversation.title, MAX_NAME_LENGTH)}
          </Typography>
          {conversation.lastMessage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                color="secondary.contrastText"
                sx={{ fontSize: '12px', width: 'fit-content' }}
              >
                {formatHourAndMinutes(
                  new Date(conversation.lastMessage.createdAt),
                )}{' '}
                -
              </Typography>

              <Typography sx={{ fontSize: '12px', width: 'fit-content' }}>
                {truncateString(
                  conversation.lastMessage.message,
                  MAX_LAST_MESSAGE_LENGTH,
                )}
              </Typography>
            </Box>
          )}
        </Box>

        <CardActions disableSpacing sx={{ p: 0, ml: 'auto' }}>
          <IconButton
            // onClick={() => setSelectedConversation(conversation)}
            sx={{ marginLeft: 'auto' }}
            aria-label="display graph"
          >
            <KeyboardArrowRight sx={{ color: 'text.secondary' }} />
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );
};
