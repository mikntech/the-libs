import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ServerContext } from './index';
import { Typography } from '@mui/material';
import { User } from '@the-libs/auth-shared';

interface AuthContextProps {
  children: ReactNode;
  MainMessage: (props: { text: string }) => ReactNode;
}

interface AuthContextType {
  user?: User;
  profilePictureUrl?: string;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  refreshUserData: async () => {
    return;
  },
  logout: async () => {
    return;
  },
});

export const AuthContextProvider = ({
  children,
  MainMessage = ({ text }: { text: string }) => <Typography>{text}</Typography>,
}: AuthContextProps) => {
  const [user, setUser] = useState<User>();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>();

  const [loading, setLoading] = useState(true);

  const server = useContext(ServerContext);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await server?.axiosInstance.get<User>(
        'api/auth/log/' /* + client*/,
      );
      response?.data && setUser(response?.data);
    } catch {
      setUser(undefined);
    } finally {
      try {
        const urlResponse = await server?.axiosInstance.get(
          'api/auth/get-signed-profile-picture/128',
        );
        urlResponse?.data && setProfilePictureUrl(urlResponse.data);
      } catch {
        /* no profile picture */
      }
    }
  }, [server?.axiosInstance]);

  const logout = async () => {
    try {
      await server?.axiosInstance.get<undefined>('api/auth/log/out');
      setUser(undefined);
    } catch (error) {
      console.log('Error during sign out', error);
    }
    refreshUserData();
  };

  useEffect(() => {
    const initializeData = async () => {
      await refreshUserData();
      setLoading(false);
    };

    initializeData().then();
  }, [refreshUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        refreshUserData,
        logout,
        profilePictureUrl,
      }}
    >
      {loading ? (
        <MainMessage text="Checking if you are signed in..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
