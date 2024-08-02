import { ReactNode, createContext } from "react";

interface AppContextProps<UserType> {
  children: ReactNode;
  app: UserType;
}

export const getAppContext = <UserType,>(tEnum: { admin: UserType }) =>
  createContext<{
    app?: UserType;
  }>({
    app: tEnum.admin,
  });

export const AppContextProvider = <UserType,>({
  children,
  app,
}: AppContextProps<UserType>) => {
  const AppContext = getAppContext<UserType>({ admin: app });
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
