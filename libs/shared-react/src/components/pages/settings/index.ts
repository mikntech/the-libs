import styled from "@emotion/styled";
import { Container, Paper } from "@mui/material";

export const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
`;

export const StyledPaper = styled(Paper)`
  padding: 16px;
  width: 100%;
  max-width: 600px;
`;

export * from "./SettingsPage";

export * from "./PictureUploader";
