import { useContext, useEffect } from 'react';
import { Grid, Typography } from '@mui/material';
import { TODO } from '@the-libs/base-shared';
import { AuthContext, ServerContext } from '../../../context';
import { axiosErrorToaster } from '../../../utils';

/**
 * Global declaration so TypeScript knows about `window.google`.
 * You can put this in a separate `global.d.ts` file if you prefer.
 */
declare global {
  interface Window {
    google?: TODO;
  }
}

export interface WithGoogleProps {
  GOOGLE_CLIENT_ID: string;
  onLoginSuccess?: (user: TODO) => void;
  onLoginFailure?: (error: TODO) => void;
  userType?: string;
  prompt?: boolean;
  authRoute?: string;
}

export const WithGoogle = ({
  GOOGLE_CLIENT_ID,
  onLoginSuccess,
  onLoginFailure = (e) => console.log(e),
  userType = '',
  prompt = true,
  authRoute = 'auth/api',
}: WithGoogleProps) => {
  const server = useContext(ServerContext);
  const { refreshUserData } = useContext(AuthContext);

  const defaultOnLoginSuccess = ({ credential }: { credential: string }) =>
    server?.axiosInstance
      .get(authRoute + '/log/useGoogle/' + userType + '?token=' + credential)
      .then(() => refreshUserData())
      .catch((error) => axiosErrorToaster(error));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) {
      return;
    }
    const handleCredentialResponse = (response: TODO) => {
      (onLoginSuccess ?? defaultOnLoginSuccess)(response);
    };
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-sign-in-btn'),
      { theme: 'outline', size: 'large' },
    );
    if (prompt) window.google.accounts.id.prompt();
  }, [GOOGLE_CLIENT_ID, onLoginSuccess, onLoginFailure]);

  return (
    <Grid container direction="column" alignItems="center" rowSpacing={2}>
      <Grid>
        <Typography>Or: </Typography>
      </Grid>
      <Grid>
        <div id="google-sign-in-btn">Sign in with Google</div>
      </Grid>
    </Grid>
  );
};

export default WithGoogle;
