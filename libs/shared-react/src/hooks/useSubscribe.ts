import { useEffect, useState } from "react";
import { getBaseURL } from "../";

export const useSubscribe = <T = string>(endpoint: string) => {
  const [res, setRes] = useState<T>();

  useEffect(() => {
    const eventSource = new EventSource(getBaseURL() + endpoint, {
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
