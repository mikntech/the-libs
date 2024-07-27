import { useMediaQuery } from "@mui/material";

export const useResponsiveness = (mobile: boolean) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMobileOrTabl = useMediaQuery("(max-width:900px)");
  return {
    isMobile: mobile || isMobile,
    isMobileOrTabl: mobile || isMobileOrTabl,
  };
};
