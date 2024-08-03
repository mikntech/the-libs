import { ThemeOptions } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { findMe, getSunTimes } from '../utils';

export const backGroundColor = '#FFFFFF';
export const themeColor = '#005FAF';

export const useIsNight = () => {
  const calculateIsNight = async () => {
    const todayat6 = new Date(Date.now()).setHours(6, 0, 0, 0);
    const todayat18 = new Date(Date.now()).setHours(18, 0, 0, 0);
    const sunTimes = await getSunTimes(await findMe());
    return window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : new Date().getTime() <
          (sunTimes?.sunrise?.getTime
            ? sunTimes?.sunrise?.getTime()
            : todayat6) || new Date().getHours() >= todayat18;
  };

  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    calculateIsNight().then((isNight) => setIsNight(isNight));
  }, []);

  return isNight;
};

export const useThemeForMVP = () => {
  const isNight = useIsNight();
  const theme = useMemo(
    () =>
      ({
        palette: {
          mode: isNight ? 'dark' : 'light',
          primary: {
            main: isNight ? '#42A5F5' : themeColor,
            contrastText: isNight ? '#FFFFFF' : '#171C1E',
          },
          secondary: {
            main: isNight ? '#FFB77E' : '#F69337',
            contrastText: isNight ? '#ffffff' : '#696F71',
          },
          error: {
            main: isNight ? '#FFB4AB' : '#BA1A1A',
            contrastText: isNight ? '#690005' : '#FFFFFF',
          },
          warning: {
            main: isNight ? '#FFCA28' : '#FFC107',
            contrastText: isNight ? '#6B4F00' : '#FFFFFF',
          },
          info: {
            main: isNight ? '#90CAF9' : '#2196F3',
            contrastText: isNight ? '#00396B' : '#FFFFFF',
          },
          success: {
            main: isNight ? '#A5D6A7' : '#4CAF50',
            contrastText: isNight ? '#015f06' : '#FFFFFF',
          },
          text: {
            primary: isNight ? '#FFFFFF' : '#000000',
            secondary: isNight ? '#FFFFFF' : '#696F71',
          },
          background: {
            default: isNight ? '#171C1E' : '#FFFFFF',
            paper: isNight ? '#373D3E' : backGroundColor,
          },
        },
        typography: {
          fontFamily: '"Roboto", "Arial", sans-serif',
          h1: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '2.25rem',
          },
          h2: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '2rem',
          },
          h3: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '1.75rem',
          },
          h4: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '1.5rem',
          },
          h5: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '1.25rem',
          },
          h6: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
          },
          subtitle1: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontSize: '0.875rem',
          },
          subtitle2: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontSize: '0.875rem',
          },
          body1: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontSize: '1rem',
          },
          body2: {
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontSize: '0.875rem',
          },
        },
      }) as ThemeOptions,
    [isNight],
  );

  return theme;
};
