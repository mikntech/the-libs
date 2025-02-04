import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ServerContext } from './index';
import { User } from '@the-libs/auth-shared';
import { MainMessage as DefaultMainMessage } from '../';

interface AuthContextProps {
  children: ReactNode;
  MainMessage?: (props: { text: string }) => ReactNode;
  authRoute?: string;
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
  MainMessage = DefaultMainMessage,
  authRoute = 'auth/api',
}: AuthContextProps) => {
  const [user, setUser] = useState<User>();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>();

  const [loading, setLoading] = useState(true);

  const server = useContext(ServerContext);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await server?.axiosInstance.get<User>(
        authRoute + '/log/' /* + client*/,
      );
      if (typeof response?.data === 'object') setUser(response?.data);
      else setUser(undefined);
    } catch {
      setUser(undefined);
    } finally {
      try {
        const urlResponse = await server?.axiosInstance.get(
          authRoute + '/get-signed-profile-picture/128',
        );
        if (urlResponse?.data) setProfilePictureUrl(urlResponse.data);
      } catch {
        /* no profile picture */
      }
    }
  }, [server?.axiosInstance]);

  const logout = async () => {
    try {
      await server?.axiosInstance.get<undefined>(authRoute + '/log/out');
      setUser(undefined);
    } catch (error) {
      console.log('Error during sign out', error);
    }
    refreshUserData().then();
  };

  useEffect(() => {
    const initializeData = async () => {
      await refreshUserData();
      setLoading(false);
    };

    initializeData().then();
  }, [refreshUserData]);

  const value = useMemo(
    () => ({
      user,
      refreshUserData,
      logout,
      profilePictureUrl,
    }),
    [user, profilePictureUrl],
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <MainMessage text="Checking if you are signed in..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
