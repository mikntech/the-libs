import {
  Button,
  ButtonProps,
  Container,
  Fab,
  FabProps,
  IconButton,
  IconButtonProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useResponsiveness } from "../hooks";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { UserType } from "@offisito/shared";

interface PrimaryTextProps extends TypographyProps {
  padded?: boolean;
}

export const PrimaryText = ({ padded, ...rest }: PrimaryTextProps) => {
  const { app } = useContext(AppContext);
  const { isMobile } = useResponsiveness(app === UserType.guest);

  return (
    <Typography
      color={(theme) => theme.palette.primary.contrastText}
      sx={{
        wordBreak: "break-word",
        ...(!isMobile && app === UserType.guest
          ? { fontSize: "clamp(1rem, 1.5vw + 0.5rem, 2rem)" }
          : {}),
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...(padded ? { padding: "20px 25px 0 25px" } : {}),
      }}
      {...rest}
    >
      {rest.children}
    </Typography>
  );
};

export const OFAB = (props: FabProps & { isGuest?: boolean }) => {
  const { isMobileOrTabl } = useResponsiveness(!!props.isGuest);
  return (
    <Fab
      sx={{
        position: "fixed",
        bottom: "10%",
        right: isMobileOrTabl ? "5%" : "calc(5% + (100vw - 1000px) / 2)",
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Fab>
  );
};

export const CloseButton = (props: IconButtonProps) => (
  <IconButton
    {...props}
    sx={{ bgcolor: "red", borderRadius: "10px", ...(props.sx || {}) }}
  >
    <Close />
  </IconButton>
);

export const CloseAndSave = (props: ButtonProps) => <Btn {...props}>Close</Btn>;

export const AddButton = (props: IconButtonProps) => (
  <IconButton sx={{ bgcolor: "green", borderRadius: "10px" }} {...props}>
    <Add />
  </IconButton>
);

export const SettingsTabContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
`;

export const Btn = (props: ButtonProps) => (
  <Button
    variant="contained"
    {...props}
    sx={{
      color: "white",
      borderRadius: "18px",
      ...props.sx,
    }}
  >
    {props.children}
  </Button>
);
