import { useEffect } from 'react';

/**
 * Global declaration so TypeScript knows about `window.google`.
 * You can put this in a separate `global.d.ts` file if you prefer.
 */
declare global {
  interface Window {
    google?: any;
  }
}

export interface WithGoogleProps {
  GOOGLE_CLIENT_ID: string;
  onLoginSuccess: (user: any) => void; // Adjust types for your actual user object
  onLoginFailure: (error: any) => void; // Adjust types for your actual errors
}

export function WithGoogle({
  GOOGLE_CLIENT_ID,
  onLoginSuccess,
  onLoginFailure,
}: WithGoogleProps) {
  useEffect(() => {
    // If we're on the server (Next.js SSR) or the script isn't loaded yet, do nothing.
    if (typeof window === 'undefined' || !window.google) {
      return;
    }

    // Callback once Google is ready with user credentials
    const handleCredentialResponse = (response: any) => {
      // Example: response.credential is your JWT token
      onLoginSuccess(response);
    };

    // Initialize the Google "One Tap" or Sign in button
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    // Render the button on the given DOM element
    window.google.accounts.id.renderButton(
      document.getElementById('google-sign-in-btn'),
      { theme: 'outline', size: 'large' },
    );

    // Optionally show the One Tap prompt if the user is logged in
    window.google.accounts.id.prompt();

    // Cleanup (optional): if you need to handle sign-out, remove event listeners, etc.
    return () => {
      // e.g., window.google.accounts.id.cancel() if you wanted to kill a prompt
    };
  }, [GOOGLE_CLIENT_ID, onLoginSuccess, onLoginFailure]);

  return <div id="google-sign-in-btn">Sign in with Google</div>;
}

export default WithGoogle;
