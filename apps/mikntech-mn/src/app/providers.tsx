// app/providers.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function fetchConfig() {
      const res = await fetch('/api/config');
      const data = await res.json();
      posthog.init(data.posthogKey, {
        api_host: data.posthogHost || process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
      });
    }
    fetchConfig();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
