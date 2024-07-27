import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  axiosErrorToaster,
  MainMessage,
  ServerContext,
  useSubscribe,
} from "@offisito/shared-react";
import { Amenity, Asset, Building, Company } from "@offisito/shared";

interface ListingsContextProps {
  children: ReactNode;
}

export const ListingsContext = createContext<{
  buildings: { value: string; label: string }[];
  myProfiles?: Company[];
  myAssets?: Asset[];
  amenities: Amenity[];
}>({
  buildings: [],
  myProfiles: [],
  myAssets: [],
  amenities: [],
});

export const ListingsContextProvider = ({ children }: ListingsContextProps) => {
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(true);

  const server = useContext(ServerContext);
  const [myProfiles, setMyProfiles] = useState<Company[]>([]);

  const [buildings, setBuildings] = useState<
    { value: string; label: string }[]
  >([]);

  const { res } = useSubscribe("api/host/subscribe");

  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        "/api/host/buildings/get_buildings_list",
      );
      setBuildings(
        res?.data.map(({ address, _id }: Building) => ({
          label: address?.street || address?.city,
          value: _id,
        })),
      );
      setLoading1(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance]);

  useEffect(() => {
    fetchBuildings().then();
  }, [fetchBuildings, res]);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        "/api/host/companies/get_companies_list",
      );
      res &&
        setMyProfiles(
          res.data.map((company: Company) => {
            const building =
              company.building &&
              buildings.find(
                ({ value }) =>
                  value?.toString() === company.building.toString(),
              );
            return {
              ...company,
              building: building?.label || building?.value || company.building,
            };
          }),
        );
      setLoading2(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [buildings, server?.axiosInstance]);

  useEffect(() => {
    fetchProfiles().then();
  }, [fetchProfiles, res]);

  const [myAssets, setMyAssets] = useState<Asset[]>([]);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get(
        "/api/host/assets/assets_list",
      );
      res && setMyAssets(res.data);
      setLoading3(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance]);

  useEffect(() => {
    fetchAssets().then();
  }, [fetchAssets, res]);

  const fetchAmenities = useCallback(async () => {
    try {
      const res = await server?.axiosInstance.get("/api/amenities");
      res && setAmenities(res.data);
      setLoading4(false);
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server?.axiosInstance]);

  useEffect(() => {
    fetchAmenities().then();
  }, [fetchAmenities, res]);

  return (
    <ListingsContext.Provider
      value={{
        buildings,
        myProfiles,
        myAssets,
        amenities,
      }}
    >
      {loading1 || loading2 || loading3 || loading4 ? (
        <MainMessage text="Loading you listings..." />
      ) : (
        children
      )}
    </ListingsContext.Provider>
  );
};
