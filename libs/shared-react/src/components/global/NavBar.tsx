import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
  buttons: { navPath: string; iconSrc: string }[];
}

const NavBar = ({ buttons }: NavBarProps) => {
  const navigate = useNavigate();

  return (
    <BottomNavigation
      sx={{ bgcolor: (theme) => theme.palette.primary.main }}
      showLabels
      onChange={(_, newValue) => {
        const path = buttons[newValue]?.navPath;
        if (path) {
          navigate(path);
        }
      }}
    >
      {buttons.map(({ iconSrc }) => (
        <BottomNavigationAction
          key={iconSrc}
          icon={<Box component="img" src={iconSrc} />}
        />
      ))}
    </BottomNavigation>
  );
};

export default NavBar;
