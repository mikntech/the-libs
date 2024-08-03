import { useEffect, useState } from 'react';
import { getBaseURL } from '../';

export const useSubscribe = <T = string>(domain: string, endpoint: string) => {
  const [res, setRes] = useState<T>();

  useEffect(() => {
    const eventSource = new EventSource(getBaseURL(domain) + endpoint, {
      withCredentials: true,
    });
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
