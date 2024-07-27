import { PrimaryText, useResponsiveness } from "@offisito/shared-react";
import styled from "@emotion/styled";
import { ReactNode } from "react";
import { Box, Grid } from "@mui/material";

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
  children: ReactNode;
}

export const MobilzerWrapper = ({ children }: MobilzerWrapperProps) => {
  const { isMobile } = useResponsiveness(false /*This is not a mistake*/);

  return isMobile ? (
    children
  ) : (
    <Grid container justifyContent="center" columnSpacing={8} wrap="nowrap">
      <Grid item>
        <MobileContainer>{children}</MobileContainer>
      </Grid>
      <Grid item>
        <DesktopMessage>
          <PrimaryText variant="h5">
            For the best experience please use offisito app on a mobile device
          </PrimaryText>
        </DesktopMessage>
      </Grid>
    </Grid>
  );
};
