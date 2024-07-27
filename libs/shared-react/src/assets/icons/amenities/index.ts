import { TODO } from "@offisito/shared";
import Kitchen from "./Kitchen.svg";
import Lounge from "./Lounge.svg";
import Parking from "./Parking.svg";
import PC from "./PC.svg";
import Restaurants from "./Restaurants.svg";
import WiFi from "./WiFi.svg";

export const getAmenityIcon = (name: string) => {
  const map: TODO = {
    Kitchen,
    Lounge,
    Parking,
    PC,
    Restaurants,
    WiFi,
  };
  return map[name];
};
