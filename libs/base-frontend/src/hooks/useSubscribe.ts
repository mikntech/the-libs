import { useEffect, useState } from 'react';
import { getBaseURL } from '../';

export const useSubscribe = <T = string>(
  VITE_STAGING_ENV?: string,
  domain?: string,
  endpoint?: string,
  serverPort = 5556,
  fullURI?: string,
) => {
  const [res, setRes] = useState<T>();

  useEffect(() => {
    const eventSource = new EventSource(
      fullURI ??
        (domain && VITE_STAGING_ENV
          ? getBaseURL(domain, VITE_STAGING_ENV, serverPort) + endpoint
          : 'error calling useSubscribe'),
      {
        withCredentials: true,
      },
    );
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      res !== data && setRes(data);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return { res };
};
