import {
  AuthContext,
  axiosErrorToaster,
  Btn,
  PrimaryText,
  ServerContext,
  SettingsTabContainer,
  StyledPaper,
  useResponsiveness,
} from "../../../";
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NotificationRule, PushDevice, Rules } from "@offisito/shared";
import { Delete } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";
import { FormControlLabel, Grid, IconButton, Switch } from "@mui/material";

interface NotificationsTabProps {
  isGuest?: boolean;
}

export const NotificationsTab = ({ isGuest }: NotificationsTabProps) => {
  const server = useContext(ServerContext);

  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [devices, setDevices] = useState<PushDevice[]>([]);

  const fetchDevices = useCallback(async () => {
    try {
      server &&
        setDevices(
          (await server.axiosInstance.get("api/notifications/settings/devices"))
            .data,
        );
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const [rules, setRules] = useState<NotificationRule[]>([]);

  const fetchRules = useCallback(async () => {
    try {
      server &&
        setRules(
          (await server.axiosInstance.get("api/notifications/settings/rules"))
            .data,
        );
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSubscribeClick = () => {
    navigator.serviceWorker.ready.then((registration) => {
      const base64String =
        "BH1R9v3i49K6RwINhRAIGDWeD5Qc4P8goayR9Zse5GHr8P6TftjYECx98M-C7YBpA-DPbnM_k_QdZgQc5QnWgU8";
      const padding = "=".repeat((4 - (base64String?.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData?.length);
      for (let i = 0; i < rawData?.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray,
        })
        .then((pushSubscription) => {
          const subscription = {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: pushSubscription?.toJSON()?.keys?.p256dh,
              auth: pushSubscription?.toJSON()?.keys?.auth,
            },
          };
          server?.axiosInstance
            ?.post("api/notifications/settings/device", {
              name,
              subscription,
            })
            .then(() => fetchDevices());
        })
        .catch((error) => {
          console.log("Error during getSubscription()", error);
        });
    });
  };

  const { isMobile } = useResponsiveness(!!isGuest);

  return (
    <SettingsTabContainer maxWidth={isMobile ? "xs" : "sm"}>
      <PrimaryText variant="h4" gutterBottom>
        Notifications Settings
      </PrimaryText>
      <StyledPaper>
        <Grid container direction="column" rowSpacing={2}>
          <Grid item>
            <PrimaryText variant="subtitle1" gutterBottom>
              <strong>Email Address:</strong> {user?.email}
            </PrimaryText>
          </Grid>
          <Grid item>
            <PrimaryText variant="subtitle1" gutterBottom>
              <strong>Phone Number:</strong> {user?.phone}
            </PrimaryText>
          </Grid>

          {devices.map(({ _id, name }) => (
            <Grid
              key={_id.toString()}
              item
              container
              alignItems="center"
              columnSpacing={4}
            >
              <Grid item>
                <PrimaryText>
                  <strong>Push:</strong> {name}
                </PrimaryText>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() =>
                    server?.axiosInstance
                      .delete(
                        "api/notifications/settings/device/" +
                          String(_id.toString()),
                      )
                      .then(() => fetchDevices())
                  }
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item container alignItems="center" columnSpacing={4}>
            <Grid item>
              <TextField
                variant="outlined"
                label="Device Name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                }}
              />
            </Grid>
            <Grid item>
              <Btn onClick={handleSubscribeClick}>
                Add {isMobile ? "" : " this device"}
              </Btn>
            </Grid>
          </Grid>
          {Object.keys(Rules).map((key) => (
            <Grid
              key={key}
              item
              container
              alignItems="center"
              columnSpacing={1}
            >
              <Grid item>
                <PrimaryText fontSize={isMobile ? "90%" : "100%"}>
                  <strong>
                    {(Rules as typeof Rules)[key as keyof typeof Rules]} via :
                  </strong>
                </PrimaryText>
              </Grid>
              {isMobile && <Grid item xs={12} />}
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        rules.find(({ key: lkey }) => lkey === key)?.push
                      }
                      onChange={(e) =>
                        server?.axiosInstance
                          .patch("api/notifications/settings/rule", {
                            key,
                            channel: "push",
                            value: e.target.checked,
                          })
                          .then(() => {
                            toast.success("Settings Updated");
                            fetchRules();
                          })
                          .catch((e) => axiosErrorToaster(e))
                      }
                    />
                  }
                  label="Push"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        rules.find(({ key: lkey }) => lkey === key)?.email
                      }
                      onChange={(e) =>
                        server?.axiosInstance
                          .patch("api/notifications/settings/rule", {
                            key,
                            channel: "email",
                            value: e.target.checked,
                          })
                          .then(() => {
                            toast.success("Settings Updated");
                            fetchRules();
                          })
                          .catch((e) => axiosErrorToaster(e))
                      }
                    />
                  }
                  label="Email"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rules.find(({ key: lkey }) => lkey === key)?.sms}
                      onChange={(e) =>
                        server?.axiosInstance
                          .patch("api/notifications/settings/rule", {
                            key,
                            channel: "sms",
                            value: e.target.checked,
                          })
                          .then(() => {
                            toast.success("Settings Updated");
                            fetchRules();
                          })
                          .catch((e) => axiosErrorToaster(e))
                      }
                    />
                  }
                  label="SMS"
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </StyledPaper>
    </SettingsTabContainer>
  );
};
