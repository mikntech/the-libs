import { createContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';
import { Typography } from '@mui/material';

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
  tryInterval?: number;
}

interface ServerContextProps {
  axiosInstance: AxiosInstance;
  version: string;
}

export const ServerContext = createContext<ServerContextProps | null>(null);

export const getBaseURL = (domain: string, VITE_WHITE_ENV: string) => {
  const prefix = VITE_WHITE_ENV === 'preprod' ? 'pre' : '';
  return VITE_WHITE_ENV === 'local'
    ? 'http://localhost:5556/'
    : `https://${prefix}${domain}/`;
};

export const ServerProvider = <FES extends { VITE_WHITE_ENV: string }>({
  children,
  domain,
  frontendSettings,
  exactDomainURI,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
  tryInterval = DEFAULT_TRY_INTERVAL,
}: ServerProviderProps<FES>) => {
  const { VITE_WHITE_ENV } = frontendSettings();

  const [status, setStatus] = useState<string>(FIRST_MESSAGE);
  const [version, setVersion] = useState<string>('');

  const axiosInstance = axios.create({
    baseURL: exactDomainURI || getBaseURL(domain, VITE_WHITE_ENV),
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
        setStatus(newStatus);
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
