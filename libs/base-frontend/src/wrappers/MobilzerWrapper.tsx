import { useResponsiveness } from '@the-libs/base-frontend';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Box, Grid2, Typography } from '@mui/material';
import { TODO } from '@the-libs/base-shared';

const MobileContainer = styled(Box)`
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #0000000;
  height: 96vh;
  width: calc(98vh / 16 * 9);
  margin-top: 2vh;
  overflow: hidden;
`;

const DesktopMessage = styled(Box)`
  text-align: center;
  margin-left: 20px;
  margin-top: 300px;
  font-size: 18px;
  color: #666;
  align-self: center;
`;

interface MobilzerWrapperProps {
  name: string;
  children: ReactNode;
  PrimaryText?: TODO;
}

export const MobilzerWrapper = ({
  name,
  children,
  PrimaryText = Typography,
}: MobilzerWrapperProps) => {
  const { isMobile } = useResponsiveness(false /*This is not a mistake*/);

  return isMobile ? (
    children
  ) : (
    <Grid2 container justifyContent="center" columnSpacing={8} wrap="nowrap">
      <Grid2>
        <MobileContainer>{children}</MobileContainer>
      </Grid2>
      <Grid2>
        <DesktopMessage>
          <PrimaryText variant="h5">
            For the best experience please use {name} app on a mobile device
          </PrimaryText>
        </DesktopMessage>
      </Grid2>
    </Grid2>
  );
};
