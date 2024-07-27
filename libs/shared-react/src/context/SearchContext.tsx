import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
  useContext,
  useCallback,
} from "react";
import { ServerContext } from "./ServerContext";
import { axiosErrorToaster } from "../components";
import { Asset, Query } from "@offisito/shared";

interface SearchContextProps {
  children: ReactNode;
}

export const SearchContext = createContext<{
  results: Asset[] | undefined;
  setResults: Dispatch<SetStateAction<Asset[] | undefined>>;
  query: Query;
  setQuery: Dispatch<SetStateAction<Query>>;
  search: boolean;
  setSearch: Dispatch<SetStateAction<boolean>>;
  fetch: () => Promise<void>;
}>({
  results: undefined,
  setResults: () =>
    console.warn("setState function called without a context provider"),
  search: false,
  setSearch: () =>
    console.warn("setState function called without a context provider"),
  fetch: async () => console.log("called without a context provider"),
  query: { config: {}, params: {} },
  setQuery: () =>
    console.warn("setState function called without a context provider"),
});

export const SearchContextProvider = ({ children }: SearchContextProps) => {
  const server = useContext(ServerContext);
  const [results, setResults] = useState<Asset[]>();
  const [query, setQuery] = useState<Query>({
    config: {},
    params: {},
  });
  const [search, setSearch] = useState<boolean>(false);

  const fetch = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        "api/search/" + JSON.stringify(query),
      );
      res && setResults(res.data);
      setSearch(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance, setResults, query]);

  return (
    <SearchContext.Provider
      value={{
        results,
        setResults,
        query,
        setQuery,
        fetch,
        search,
        setSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
