import {
  Avatar,
  Badge,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { MouseEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  ChatContext,
  SearchContext,
  ServerContext,
} from "../../context";
import { useIsNight } from "../../themes";
import { useResponsiveness } from "../../hooks";
import { dayLogo } from "../../assets";
import { Img, PrimaryText } from "../../index";

interface TopBarProps {
  routes?: { name: string; route: string }[];
  isGuest?: boolean;
}

export const TopBar = ({ routes, isGuest }: TopBarProps) => {
  const { user, logout, profilePictureUrl, refreshUserData } =
    useContext(AuthContext);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const server = useContext(ServerContext);

  const navigate = useNavigate();

  const { totalUnReadCounter } = useContext(ChatContext);

  const { setSearch } = useContext(SearchContext);

  const handleCloseUserMenu = async (route: string) => {
    setAnchorElUser(null);
    route === "logout" && (await logout());
    route && navigate(route);
    route && setSearch && setSearch(false);
    refreshUserData();
  };

  const isNight = useIsNight();
  const { isMobile } = useResponsiveness(!!isGuest);

  const chats = routes?.find(({ name }) => name === "Chats");
  if (chats)
    chats.name = `Chats${totalUnReadCounter ? ` (${totalUnReadCounter})` : ""}`;

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      wrap="nowrap"
      height="80px"
      bgcolor={(theme) => theme.palette.background.paper}
      border={(theme) => `0.1vw solid ${theme.palette.text.primary}`}
      borderRadius="5px"
      padding="0px 25px 0 25px"
    >
      <Grid item>
        <Tooltip title={"version: " + server?.version} placement="right-start">
          <Img
            src={isNight ? dayLogo : dayLogo}
            width={"80%"}
            onClick={() => navigate("/")}
          />
        </Tooltip>
      </Grid>
      <Grid item>
        <Tooltip title={routes ? "Open settings" : ""}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Badge badgeContent={totalUnReadCounter} color="error">
              <Avatar
                alt={user?.full_name || "username"}
                src={profilePictureUrl}
              >
                {user?.full_name ? user?.full_name[0] : "?"}
              </Avatar>
            </Badge>
          </IconButton>
        </Tooltip>
        {routes && (
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={() => handleCloseUserMenu("")}
          >
            {routes.map(({ name, route }) => (
              <MenuItem key={route} onClick={() => handleCloseUserMenu(route)}>
                <PrimaryText textAlign="center">{name}</PrimaryText>
              </MenuItem>
            ))}
          </Menu>
        )}
      </Grid>
    </Grid>
  );
};
