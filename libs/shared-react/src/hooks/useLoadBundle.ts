import { useEffect } from "react";

export const useLoadBundle = () => {
  useEffect(() => {
    const loader: HTMLDivElement | null = document.querySelector(".bndloader");
    if (loader) {
      loader.style.display = "none";
    }
  }, []);
};
