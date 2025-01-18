import { Box, Button, Grid2, Typography } from '@mui/material';

import { TODO } from '@the-libs/base-shared';
import { useResponsiveness } from '../../../hooks';
import { AuthComponent, AuthCustomComponents } from './AuthComponent';

interface AuthPageProps<UserType> {
  backgroundPicture: string;
  nightLogoTextOnly: string;
  dayLogoTextOnly: string;
  defaultMainClient: string;
  clientTypesEnum: TODO;
  client: UserType;
  disableDarkMode?: boolean;
  customComponents?: Partial<AuthCustomComponents>;
}

export const AuthPage = <UserType,>({
  backgroundPicture,
  nightLogoTextOnly,
  dayLogoTextOnly,
  clientTypesEnum,
  defaultMainClient,
  disableDarkMode,
  client,
  customComponents = {
    Btn: Button,
    PrimaryText: Typography,
    Img: Box,
  },
}: AuthPageProps<UserType>) => {
  if (!customComponents.Btn) customComponents.Btn = Button;
  if (!customComponents.PrimaryText) customComponents.PrimaryText = Typography;
  if (!customComponents.Img) customComponents.Img = Box;
  const newCustomComponents =
    customComponents as unknown as AuthCustomComponents;

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
        container
        width={
          isMobileOrTabl || client === 'guest' || client === 'host'
            ? '100%'
            : '40%'
        }
        height="100%"
        justifyContent="center"
        paddingTop="13%"
      >
        <AuthComponent
          customComponents={newCustomComponents}
          clientTypesEnum={clientTypesEnum}
          client={client}
          nightLogoTextOnly={nightLogoTextOnly}
          dayLogoTextOnly={dayLogoTextOnly}
          defaultMainClient={defaultMainClient}
          disableDarkMode={disableDarkMode}
        />
      </Grid2>
      {client === 'host' && !isMobileOrTabl && (
        <Grid2 width="60%" height="100%">
          <customComponents.Img src={backgroundPicture} bg />
        </Grid2>
      )}
    </Grid2>
  );
};
