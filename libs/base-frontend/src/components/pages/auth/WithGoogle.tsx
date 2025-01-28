import { useContext, useEffect } from 'react';
import { Grid2, Typography } from '@mui/material';
import { TODO } from '@the-libs/base-shared';
import { ServerContext } from '../../../context';

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
}

export const WithGoogle = ({
  GOOGLE_CLIENT_ID,
  onLoginSuccess,
  onLoginFailure = (e) => console.log(e),
  userType = '',
}: WithGoogleProps) => {
  const server = useContext(ServerContext);

  const defaultOnLoginSuccess = ({ credential }: { credential: string }) =>
    server?.axiosInstance.get(
      '/api/useGoogle/' + userType + '?token=' + credential,
    );

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
    window.google.accounts.id.prompt();
  }, [GOOGLE_CLIENT_ID, onLoginSuccess, onLoginFailure]);

  return (
    <Grid2 container direction="column" alignItems="center" rowSpacing={2}>
      <Grid2>
        <Typography>Or: </Typography>
      </Grid2>
      <Grid2>
        <div id="google-sign-in-btn">Sign in with Google</div>
      </Grid2>
    </Grid2>
  );
};

export default WithGoogle;
