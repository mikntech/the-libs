import { Computer, Domain, LocalParking, Wifi } from "@mui/icons-material";
import toast from "react-hot-toast";
import { Box, BoxProps, CircularProgress, Grid, useTheme } from "@mui/material";
import { PrimaryText } from "../../styled-components";
import { TODO } from "@offisito/shared";
import { cloneElement, forwardRef, useState } from "react";

// TODO: itai@offisito.com
export const renderAmenityIcon = (amenity: string) =>
  amenity === "freeWiFi" ? (
    <Wifi />
  ) : amenity === "parking" ? (
    <LocalParking />
  ) : amenity === "lobbySpace" ? (
    <Domain />
  ) : (
    <Computer />
  );

export const axiosErrorToaster = (e: TODO) =>
  toast.error(
    typeof e?.response?.data === "object"
      ? e?.response?.data?.message ||
          e?.response?.data?.error ||
          JSON.stringify(e?.response?.data)
      : e?.response?.data ||
          (e?.response?.status
            ? "Error code " + e?.response?.status
            : "Unknown Error"),
  );

export const MainMessage = ({ text }: { text: string }) => (
  <Grid
    height="100%"
    width="100%"
    container
    justifyContent="center"
    alignItems="center"
  >
    <Grid item>
      <PrimaryText fontWeight="bold" fontSize="150%" textAlign="center">
        {text}
      </PrimaryText>
    </Grid>
  </Grid>
);

interface ImgProps extends BoxProps {
  src?: string;
  alt?: string;
  bg?: boolean;
}

export const Img = forwardRef<TODO, ImgProps>((props, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRatio16by9, setIsRatio16by9] = useState(false);
  const [error, setError] = useState(false);

  const handleImageLoad = (event: React.SyntheticEvent<TODO, Event>) => {
    setIsLoading(false);
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const ratio = naturalWidth / naturalHeight;
    setIsRatio16by9(Math.abs(ratio - 16 / 9) < 0.01);
  };

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    handleImageLoad(event);
    setError(true);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!props.bg && !isRatio16by9 && props.onClick) {
      props.onClick(event);
    }
  };

  const backgroundStyle: React.CSSProperties = props.bg
    ? {
        width: "100%",
        height: "100%", // Ensures the image covers the full height of its container
        objectFit: "cover", // Ensures the image covers the area without distorting aspect ratio
        objectPosition: "center", // Centers the image in the container
      }
    : {};

  return (
    <Box
      position="relative"
      display="inline-block"
      width="100%" // Ensures the container takes the full width of its parent
      height="100%" // Ensures the container takes the full height of its parent
      {...props}
      onClick={handleClick}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      {error ? (
        <Grid
          width="100%"
          height="100%"
          container
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <PrimaryText color="error">Error loading picture</PrimaryText>
          </Grid>
        </Grid>
      ) : (
        <Box
          component="img"
          ref={ref}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            display: isLoading ? "none" : "inline",
            ...backgroundStyle,
            ...props.style,
          }}
          {...props}
        />
      )}
    </Box>
  );
});

export const IconColorer = ({ children }: TODO) => {
  const theme = useTheme();
  const styledChild = cloneElement(children, {
    style: { color: theme.palette.primary.contrastText },
  });
  return styledChild;
};
