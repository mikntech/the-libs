'use client';
import { useEffect, useState } from 'react';
import { getBaseURL } from '../';

export const useSubscribe = <T = string | object>(
  VITE_STAGING_ENV?: string,
  domain?: string,
  endpoint?: string,
  serverPort = 5556,
  fullURI?: string,
) => {
  const [res, setRes] = useState<T>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let eventSource: EventSource;

    const createEventSource = () => {
      eventSource = new EventSource(
        fullURI ??
          (domain && VITE_STAGING_ENV
            ? getBaseURL(domain, VITE_STAGING_ENV, serverPort) + endpoint
            : 'error calling useSubscribe'),
        {
          withCredentials: true,
        },
      );

      eventSource.onmessage = ({ data }) => {
        let parsedData: T;
        try {
          parsedData = JSON.parse(data);
        } catch {
          parsedData = data;
        }
        if (res !== parsedData) setRes(parsedData);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        // Retry logic on error (like 504 Gateway Timeout)
        setRetryCount((prev) => prev + 1);
      };
    };

    createEventSource();

    // Reconnect on retry count increment
    if (retryCount > 0) {
      const retryTimeout = setTimeout(
        () => {
          createEventSource();
        },
        Math.min(1000 * retryCount, 30000),
      ); // Exponential backoff capped at 30 seconds
      return () => clearTimeout(retryTimeout);
    }

    return () => {
      eventSource.close();
    };
  }, [retryCount]);

  return { res };
};
