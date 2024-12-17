import { useEffect } from 'react';

// Make sure to update your types globally or locally as needed
declare global {
  interface Window {
    google?: any;
  }
}

export {};

interface GoogleSignInProps {
  GOOGLE_CLIENT_ID: string;
  onLoginSuccess: (user: any) => void; // Define the correct user type
  onLoginFailure: (error: any) => void; // Define the error type
}

const GoogleSignIn = ({
  GOOGLE_CLIENT_ID,
  onLoginSuccess,
  onLoginFailure,
}: GoogleSignInProps) => {
  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID; // Ensure this pulls the correct client ID dynamically

    const handleCredentialResponse = (response: any) => {
      // This function is called when the Google API successfully authenticates a user
      //
      onLoginSuccess(response);
    };

    window.onload = function () {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in-btn'),
          { theme: 'outline', size: 'large' }, // Customize according to your needs
        );

        window.google.accounts.id.prompt(); // Display the One Tap sign-in prompt
      }
    };

    // Cleanup function to potentially handle sign-out or cleanup resources
    return () => {
      // Add any cleanup logic if necessary, typically for logging out the user
    };
  }, [onLoginSuccess, onLoginFailure]);

  return (
    <div id="google-sign-in-btn">Sign in with Google</div> // This div will automatically be transformed into a sign-in button
  );
};

export default GoogleSignIn;
