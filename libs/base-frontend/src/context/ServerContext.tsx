import { createContext, useEffect, useState, ReactNode } from "react";
import axios, { AxiosInstance } from "axios";
import { Typography } from "@mui/material";

interface FrontendSettings {
  VITE_NODE_ENV: string;
  VITE_WHITE_ENV: string;
  VITE_G_MAPS: string;
  GOOGLE_CLIENT_ID: string;
}

export const frontendSettings = (): FrontendSettings => {
  let res;
  try {
    const envConfig = document.getElementById("env-config")?.textContent;
    res = JSON.parse(envConfig ?? "{}");
  } catch (e) {
    res = import.meta.env;
  }

  let ret: FrontendSettings = {
    VITE_NODE_ENV: "",
    VITE_WHITE_ENV: "",
    VITE_G_MAPS: "",
    GOOGLE_CLIENT_ID: "",
  };
  ret = { ...ret, ...res };
  return ret;
};

const DEFAULT_TRY_INTERVAL = 3000;
const GOOD_STATUS = "good";
const BAD_MESSAGE = "Server is not available. Please try again later.";
const FIRST_MESSAGE = "Connecting to server...";

interface ServerProviderProps {
  children: ReactNode;
  domain: string;
  MainMessage: (props: { text: string }) => ReactNode;
  tryInterval?: number;
}

interface ServerContextProps {
  axiosInstance: AxiosInstance;
  version: string;
}

export const ServerContext = createContext<ServerContextProps | null>(null);

const { VITE_WHITE_ENV } = frontendSettings();

const prefix = VITE_WHITE_ENV === "preprod" ? "pre" : "";

export const getBaseURL = (domain: string) =>
  VITE_WHITE_ENV === "local"
    ? "http://localhost:5556/"
    : `https://${prefix}${domain}/`;

export const ServerProvider = ({
  children,
  domain,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
  tryInterval = DEFAULT_TRY_INTERVAL,
}: ServerProviderProps) => {
  const [status, setStatus] = useState<string>(FIRST_MESSAGE);
  const [version, setVersion] = useState<string>("");

  const axiosInstance = axios.create({
    baseURL: getBaseURL(domain),
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axiosInstance.get("");
        const newStatus =
          response.status === 200 &&
          response.data["Health Check Status"] === "Im alive"
            ? GOOD_STATUS
            : BAD_MESSAGE;
        setStatus(newStatus);
        if (newStatus === GOOD_STATUS) {
          setVersion(response.data.version);
        } else {
          setTimeout(checkStatus, tryInterval);
        }
      } catch (error) {
        console.log("An error occurred while checking the server: ", error);
        setStatus(BAD_MESSAGE);
        setTimeout(checkStatus, tryInterval);
      }
    };

    checkStatus();
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
