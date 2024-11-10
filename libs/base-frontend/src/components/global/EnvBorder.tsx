import { ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';

interface EnvBorderContextProps {
  children: ReactNode;
  VITE_STAGING_ENV: string;
}

export const EnvBorder = ({
  children,
  VITE_STAGING_ENV,
}: EnvBorderContextProps) => {
  useEffect(() => {
    const adjustHeight = () => {
      const viewportHeight = window.innerHeight + 'px';
      if (document.getElementById('root') !== null)
        (document.getElementById('root') as HTMLElement).style.height =
          viewportHeight;
    };

    adjustHeight();

    window.addEventListener('resize', adjustHeight);

    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  const props = {
    width: VITE_STAGING_ENV === 'prod' ? '100%' : 'calc(100% - 8px)',
    height: VITE_STAGING_ENV === 'prod' ? '100%' : 'calc(100% - 8px)',
    sx:
      VITE_STAGING_ENV === 'prod'
        ? {}
        : VITE_STAGING_ENV === 'preprod'
          ? { border: '4px solid orange' }
          : { border: '4px solid blue' },
  };

  return (
    <Box {...props} bgcolor={(theme) => theme.palette.background.default}>
      {children}
    </Box>
  );
};
