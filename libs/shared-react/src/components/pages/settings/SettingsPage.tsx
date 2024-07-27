import { useContext, useState, useEffect, useMemo } from "react";
import { Tabs, Tab, Container, Avatar } from "@mui/material";
import { NotificationsTab } from "./NotificationsTab";
import { AccountTab } from "./AccountTab";
import { Logout, Notifications } from "@mui/icons-material";
import { AuthContext, useResponsiveness } from "../../../";
import { TODO } from "@offisito/shared";

interface NotificationsTabProps {
  isGuest?: boolean;
}

export const SettingPage = ({ isGuest }: NotificationsTabProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, profilePictureUrl, logout } = useContext(AuthContext);
  const isMobile = useResponsiveness(!!isGuest);

  const menuData = useMemo(
    () => [
      {
        name: "Manage Account",
        icon: (
          <Avatar alt={user?.full_name ?? "username"} src={profilePictureUrl}>
            {user?.full_name ? user?.full_name[0] : "?"}
          </Avatar>
        ),
        content: <AccountTab />,
        disabled: false,
      },
      {
        name: "Notifications",
        icon: <Notifications />,
        content: <NotificationsTab isGuest={isGuest} />,
        disabled: false,
      },
      {
        name: "Logout",
        icon: <Logout />,
        action: logout,
        disabled: false,
      },
    ],
    [logout, profilePictureUrl, user?.full_name, isGuest],
  );

  const handleTabChange = (_: TODO, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (menuData[activeTab].action) {
      (menuData[activeTab].action as () => void)();
    }
  }, [menuData, activeTab]);

  return (
    <Container>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
      >
        {menuData.map((item) => (
          <Tab
            key={item.name}
            label={item.name}
            icon={item.icon}
            iconPosition="start"
            disabled={item.disabled}
          />
        ))}
      </Tabs>
      <br />
      <br />
      <br />
      {menuData[activeTab].content}
    </Container>
  );
};
