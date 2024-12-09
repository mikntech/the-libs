import { Grid2, Typography, TypographyProps } from '@mui/material';
import { useResponsiveness } from '../../hooks';

export interface PrimaryTextProps extends TypographyProps {
  padded?: boolean;
}

export const PrimaryText = ({ padded, ...rest }: PrimaryTextProps) => {
  const { isMobile } = useResponsiveness(false);

  return (
    <Typography
      color="contrastText"
      sx={{
        wordBreak: 'break-word',
        ...(!isMobile ? { fontSize: 'clamp(1rem, 1.5vw + 0.5rem, 2rem)' } : {}),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(padded ? { padding: '20px 25px 0 25px' } : {}),
      }}
      {...rest}
    >
      {rest.children}
    </Typography>
  );
};

export const MainMessage = ({ text }: { text: string }) => (
  <Grid2
    height="100%"
    width="100%"
    container
    justifyContent="center"
    alignItems="center"
  >
    <Grid2>
      <PrimaryText fontWeight="bold" fontSize="150%" textAlign="center">
        {text}
      </PrimaryText>
    </Grid2>
  </Grid2>
);
