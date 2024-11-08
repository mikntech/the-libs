import { createContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';
import { Typography } from '@mui/material';
import { request, gql } from 'graphql-request';

const DEFAULT_TRY_INTERVAL = 3000;
const GOOD_STATUS = 'good';
const BAD_MESSAGE = 'Server is not available. Please try again later.';
const FIRST_MESSAGE = 'Connecting to server...';

interface ServerProviderProps<FES> {
  children: ReactNode;
  domain: string;
  exactDomainURI?: string;
  frontendSettings: () => FES;
  MainMessage: (props: { text: string }) => ReactNode;
  serverPort?: number;
  tryInterval?: number;
  gqlCheck?: boolean;
}

interface ServerContextProps {
  axiosInstance: AxiosInstance;
  version: string;
}

export const ServerContext = createContext<ServerContextProps | null>(null);

export const getBaseURL = (
  domain: string,
  VITE_WHITE_ENV: string,
  serverPort = 5556,
  exactDomainURI?: string,
) => {
  const prefix = VITE_WHITE_ENV === 'preprod' ? 'pre' : '';
  return (
    exactDomainURI ||
    (VITE_WHITE_ENV === 'local'
      ? `http://localhost:${serverPort}/`
      : `https://${prefix}${domain}/`)
  );
};

export const ServerProvider = <FES extends { VITE_WHITE_ENV: string }>({
  children,
  domain,
  frontendSettings,
  exactDomainURI,
  serverPort,
  gqlCheck,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
  tryInterval = DEFAULT_TRY_INTERVAL,
}: ServerProviderProps<FES>) => {
  const { VITE_WHITE_ENV } = frontendSettings();

  const [status, setStatus] = useState<string>(FIRST_MESSAGE);
  const [version, setVersion] = useState<string>('');

  const axiosInstance = axios.create({
    baseURL: getBaseURL(domain, VITE_WHITE_ENV, serverPort, exactDomainURI),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get('');
        const newStatus =
          response.status === 200 &&
          response.data['Health Check Status'] === 'Im alive'
            ? GOOD_STATUS
            : BAD_MESSAGE;
        let gqlLive = false;
        try {
          await request(
            getBaseURL(domain, VITE_WHITE_ENV, serverPort, exactDomainURI) +
              '/graphql',
            gql`query adxnxnxnnxnxjjjd (){}`,
          );
        } catch (e: any) {
          if (e?.response?.status === 400) gqlLive = true;
        }

        setStatus(gqlCheck ? (gqlLive ? GOOD_STATUS : BAD_MESSAGE) : newStatus);
        if (newStatus === GOOD_STATUS) {
          setVersion(response.data.Version);
        } else {
          setTimeout(checkStatus, tryInterval);
        }
      } catch (error) {
        console.log('An error occurred while checking the server: ', error);
        setStatus(BAD_MESSAGE);
        setTimeout(checkStatus, tryInterval);
      }
    };

    checkStatus().then();
  }, [axiosInstance, tryInterval]);

  if (status === GOOD_STATUS) {
    return (
      <ServerContext.Provider value={{ axiosInstance, version }}>
        {children}
      </ServerContext.Provider>
    );
  } else {
    return <MainMessage text={status} />;
  }
};
