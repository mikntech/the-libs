'use client';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

export const GoogleExp = () => (
  <GoogleOAuthProvider clientId="27110426580-bejd6ljp9aaiqi65jt93kvedsfsr9pgg.apps.googleusercontent.com">
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        fetch('http://127.0.0.1:4321/api/auth/log/google', {
          method: 'POST', // HTTP method
          headers: {
            'Content-Type': 'application/json', // Indicates that the request body is JSON
          },
          body: JSON.stringify({ token: credentialResponse.credential }), // Converts the object to a JSON string
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Assuming the server responds with JSON
          })
          .then((data) => {})
          .catch((error) => {});
      }}
      onError={() => {}}
    />
    ;
  </GoogleOAuthProvider>
);
