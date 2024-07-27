import axios from "axios";
import { TODO } from "base-backend";

export const findMe = (): Promise<null | { lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(location);
        },
        () => {
          resolve(null);
        },
      );
    }
  });
};

export const getSunTimes = async (
  location: {
    lat: number;
    lng: number;
  } | null,
) => {
  if (!location) return null;
  try {
    const { data } = await axios.get(
      `https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lng}&formatted=0`,
    );
    if (data.status === "OK") {
      return {
        sunset: new Date(data.results.sunset),
        sunrise: new Date(data.results.sunrise),
      };
    } else return null;
  } catch {
    return null;
  }
};

export const loadOffisitoFonts = () => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css?family=Roboto:400,700|Open+Sans:400,700|Inter:400,500,700&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

export const registerSW = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) =>
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        ),
      )
      .catch((error) =>
        console.log("Service Worker registration failed:", error),
      );
  }

  if ("serviceWorker" in navigator) {
    axios.get("/version").then((v) => {
      navigator.serviceWorker.ready.then((registration: TODO) => {
        registration.active.postMessage({
          action: "setVersion",
          version: v.data,
        });
      });
    });
  }
};
