import { ReactNode, createContext } from "react";
import { UserType } from "@offisito/shared";

interface AppContextProps {
  children: ReactNode;
  app: UserType;
}

export const AppContext = createContext<{
  app?: UserType;
}>({
  app: UserType.admin,
});

export const AppContextProvider = ({ children, app }: AppContextProps) => {
  return (
    <AppContext.Provider
      value={{
        app,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
