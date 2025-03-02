// app/providers.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('vaphc_XjTg42vtYQdphBwkjtetRLxylVOkxyjkfhsJQsXcS7U', {
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
