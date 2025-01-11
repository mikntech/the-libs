'use client';
import { useEffect } from 'react';
import { logEvent } from '@the-libs/analytics-frontend';

export default function Index() {
  useEffect(() => {
    logEvent('FROM MN TO MIKN', 'https://server.mikntech.com/analytics')
      .then(() => {
        // Redirect after the fetch call is done
        window.location.href = 'https://mikntech.com/#who';
      })
      .catch((error) => {
        console.error('Error sending analytics:', error);
        // Optionally still redirect even if the fetch fails
        window.location.href = 'https://mikntech.com/#who';
      });
  }, []);

  return <div>You are being redirected to the CV</div>;
}
