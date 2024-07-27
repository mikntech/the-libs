import { ReactNode, useEffect } from "react";
import Box from "@mui/material/Box";
import { frontendSettings } from "../../context";

interface EnvBorderContextProps {
  children: ReactNode;
}

export const EnvBorder = ({ children }: EnvBorderContextProps) => {
  useEffect(() => {
    const adjustHeight = () => {
      const viewportHeight = window.innerHeight + "px";
      if (document.getElementById("root") !== null)
        (document.getElementById("root") as HTMLElement).style.height =
          viewportHeight;
    };

    adjustHeight();

    window.addEventListener("resize", adjustHeight);

    return () => window.removeEventListener("resize", adjustHeight);
  }, []);

  const props = {
    width:
      frontendSettings().VITE_WHITE_ENV === "prod"
        ? "100%"
        : "calc(100% - 8px)",
    height:
      frontendSettings().VITE_WHITE_ENV === "prod"
        ? "100%"
        : "calc(100% - 8px)",
    sx:
      frontendSettings().VITE_WHITE_ENV === "prod"
        ? {}
        : frontendSettings().VITE_WHITE_ENV === "preprod"
          ? { border: "4px solid orange" }
          : { border: "4px solid blue" },
  };

  return (
    <Box {...props} bgcolor={(theme) => theme.palette.background.default}>
      {children}
    </Box>
  );
};
