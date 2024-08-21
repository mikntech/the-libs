import axios from 'axios';
import { TODO } from '@base-shared';
import toast from 'react-hot-toast';
import {
  Box,
  BoxProps,
  CircularProgress,
  Fab,
  FabProps,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { cloneElement, forwardRef, FC, useState } from 'react';
import { useResponsiveness } from '../hooks';

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

export const axiosErrorToaster = (e: TODO) =>
  toast.error(
    typeof e?.response?.data === 'object'
      ? e?.response?.data?.message ||
          e?.response?.data?.error ||
          JSON.stringify(e?.response?.data)
      : e?.response?.data ||
          (e?.response?.status
            ? 'Error code ' + e?.response?.status
            : 'Unknown Error'),
  );

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
    if (data.status === 'OK') {
      return {
        sunset: new Date(data.results.sunset),
        sunrise: new Date(data.results.sunrise),
      };
    } else return null;
  } catch {
    return null;
  }
};

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) =>
        console.log(
          'Service Worker registered with scope:',
          registration.scope,
        ),
      )
      .catch((error) =>
        console.log('Service Worker registration failed:', error),
      );
  }

  if ('serviceWorker' in navigator) {
    axios.get('/version').then((v) => {
      navigator.serviceWorker.ready.then((registration: TODO) => {
        registration.active.postMessage({
          action: 'setVersion',
          version: v.data,
        });
      });
    });
  }
};

interface ImgProps extends BoxProps {
  src?: string;
  alt?: string;
  bg?: boolean;
  PrimaryText?: FC<{ color: string }>;
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
        width: '100%',
        height: '100%', // Ensures the image covers the full height of its container
        objectFit: 'cover', // Ensures the image covers the area without distorting aspect ratio
        objectPosition: 'center', // Centers the image in the container
      }
    : {};

  const PrimaryText = props.PrimaryText || Typography;

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
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
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
            display: isLoading ? 'none' : 'inline',
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

export const OFAB = (props: FabProps & { isMobillized?: boolean }) => {
  const { isMobileOrTabl } = useResponsiveness(!!props.isMobillized);
  return (
    <Fab
      sx={{
        position: 'fixed',
        bottom: '10%',
        right: isMobileOrTabl ? '5%' : 'calc(5% + (100vw - 1000px) / 2)',
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Fab>
  );
};

export const extactNameInitials = (name: string) => {
  const names = name.split(' ');
  let initals = '';
  if (names.length > 1) {
    initals = names[0][0] + names[1][0];
  } else {
    initals = names[0][0];
  }
  return initals;
};
