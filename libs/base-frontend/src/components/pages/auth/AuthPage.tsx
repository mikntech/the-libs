import { Box, Button, Grid2, Typography } from '@mui/material';

import { TODO } from '@the-libs/base-shared';
import { useResponsiveness } from '../../../hooks';
import { WithEmail, WithEmailCustomComponents } from './WithEmail';
import WithGoogle, { WithGoogleProps } from './WithGoogle';

interface AuthPageProps<UserType> {
  backgroundPicture: string;
  nightLogoTextOnly: string;
  dayLogoTextOnly: string;
  defaultMainClient: string;
  clientTypesEnum: TODO;
  client: UserType;
  disableDarkMode?: boolean;
  withEmailCustomComponents?: Partial<WithEmailCustomComponents>;
  withGoogleProps: WithGoogleProps;
}

export const AuthPage = <UserType,>({
  backgroundPicture,
  nightLogoTextOnly,
  dayLogoTextOnly,
  clientTypesEnum,
  defaultMainClient,
  disableDarkMode,
  client,
  withEmailCustomComponents = {
    Btn: Button,
    PrimaryText: Typography,
    Img: Box,
  },
  withGoogleProps,
}: AuthPageProps<UserType>) => {
  if (!withEmailCustomComponents.Btn) withEmailCustomComponents.Btn = Button;
  if (!withEmailCustomComponents.PrimaryText)
    withEmailCustomComponents.PrimaryText = Typography;
  if (!withEmailCustomComponents.Img) withEmailCustomComponents.Img = Box;
  const newWithEmailCustomComponents =
    withEmailCustomComponents as unknown as WithEmailCustomComponents;

  const { isMobileOrTabl } = useResponsiveness(
    client === clientTypesEnum.guest || client === clientTypesEnum.host,
  );

  return (
    <Grid2
      container
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      wrap="nowrap"
      overflow="hidden"
    >
      <Grid2
        width={
          isMobileOrTabl || client === 'guest' || client === 'host'
            ? '100%'
            : '40%'
        }
        height="100%"
        justifyContent="center"
        paddingTop="13%"
      >
        <WithEmail
          customComponents={newWithEmailCustomComponents}
          clientTypesEnum={clientTypesEnum}
          client={client}
          nightLogoTextOnly={nightLogoTextOnly}
          dayLogoTextOnly={dayLogoTextOnly}
          defaultMainClient={defaultMainClient}
          disableDarkMode={disableDarkMode}
        />
      </Grid2>
      <Grid2
        width={
          isMobileOrTabl || client === 'guest' || client === 'host'
            ? '100%'
            : '40%'
        }
        height="100%"
        justifyContent="center"
        paddingTop="13%"
      >
        <WithGoogle {...withGoogleProps}></WithGoogle>
      </Grid2>
      {client === 'host' && !isMobileOrTabl && (
        <Grid2 width="60%" height="100%">
          <newWithEmailCustomComponents.Img src={backgroundPicture} bg />
        </Grid2>
      )}
    </Grid2>
  );
};
