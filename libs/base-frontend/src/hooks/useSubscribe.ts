import { useEffect, useState } from 'react';
import { getBaseURL } from '../';

export const useSubscribe = <T = string>(
  VITE_WHITE_ENV: string,
  domain: string,
  endpoint: string,
) => {
  const [res, setRes] = useState<T>();

  useEffect(() => {
    const eventSource = new EventSource(
      getBaseURL(domain, VITE_WHITE_ENV) + endpoint,
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
