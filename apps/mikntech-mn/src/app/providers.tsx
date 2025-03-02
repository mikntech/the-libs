// app/providers.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
      });
    }
    fetchConfig();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
