import { Box, Button, Grid2, Typography } from '@mui/material';

import { TODO } from '@the-libs/base-shared';
import { useResponsiveness } from '@the-libs/base-frontend';
import { WithEmail, WithEmailCustomComponents } from './WithEmail';
import WithGoogle, { WithGoogleProps } from './WithGoogle';

interface AuthPageProps<UserType> {
  backgroundPicture?: string;
  nightLogoTextOnly: string;
  dayLogoTextOnly: string;
  defaultMainClient: string;
  clientTypesEnum: TODO;
  client: UserType;
  disableDarkMode?: boolean;
  withEmailCustomComponents?: Partial<WithEmailCustomComponents>;
  withGoogleProps: WithGoogleProps;
  authRoute?: string;
}

export const AuthPage = <UserType,>({
  backgroundPicture,
  nightLogoTextOnly,
  dayLogoTextOnly,
  clientTypesEnum,
  defaultMainClient,
  disableDarkMode,
  client,
  authRoute = 'auth/api',
  withEmailCustomComponents = {
    Btn: Button,
    PrimaryText: Typography,
    Img: Box,
  },
  withGoogleProps,
}: AuthPageProps<UserType>) => {
  if (!withEmailCustomComponents.Btn)
    withEmailCustomComponents.Btn = (props: any) => (
      <Button variant="contained" {...props} />
    );
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
      width="100vw"
      height="100vh"
      direction="column"
    >
      <Grid2
        width={
          isMobileOrTabl || client === 'guest' || client === 'host'
            ? '100%'
            : '40%'
        }
        justifyContent="center"
      >
        <WithEmail
          customComponents={newWithEmailCustomComponents}
          clientTypesEnum={clientTypesEnum}
          client={client}
          nightLogoTextOnly={nightLogoTextOnly}
          dayLogoTextOnly={dayLogoTextOnly}
          defaultMainClient={defaultMainClient}
          disableDarkMode={disableDarkMode}
          authRoute={authRoute}
        />
      </Grid2>
      <Grid2
        width={
          isMobileOrTabl || client === 'guest' || client === 'host'
            ? '100%'
            : '40%'
        }
        justifyContent="center"
      >
        <WithGoogle {...withGoogleProps} authRoute={authRoute}></WithGoogle>
      </Grid2>
      {backgroundPicture && client === 'host' && !isMobileOrTabl && (
        <Grid2 width="60%" height="100%">
          <newWithEmailCustomComponents.Img src={backgroundPicture} bg />
        </Grid2>
      )}
    </Grid2>
  );
};
