import { FC, useContext } from "react";
import { Grid } from "@mui/material";
import { PictureUploader } from "./PictureUploader";
import {
  AuthContext,
  axiosErrorToaster,
  EditableField,
  PrimaryText,
  ServerContext,
  SettingsTabContainer,
  StyledPaper,
} from "../../../";
import { TODO } from "@offisito/shared";

export const AccountTab: FC = () => {
  const { user, refreshUserData, profilePictureUrl } = useContext(AuthContext);
  const server = useContext(ServerContext);

  return (
    <SettingsTabContainer maxWidth="sm">
      <PrimaryText variant="h4" gutterBottom>
        Account Settings
      </PrimaryText>
      <StyledPaper>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <PrimaryText variant="subtitle1" gutterBottom>
              <strong>Email Address:</strong> {user?.email}
            </PrimaryText>
          </Grid>
          <Grid item>
            <EditableField
              name="Phone Number"
              value={user?.phone}
              action={async (_, value: string | undefined) => {
                try {
                  value &&
                    (await server?.axiosInstance?.put(
                      "api/auth/manage/update-phone",
                      {
                        phone: value,
                      },
                    ));
                } catch (e) {
                  axiosErrorToaster(e);
                }
              }}
              cb={() => refreshUserData()}
              plus
            />
          </Grid>
          <Grid item>
            <EditableField
              name="name"
              value={user?.full_name}
              action={async (_, value: string | undefined) => {
                try {
                  value &&
                    (await server?.axiosInstance?.put(
                      "api/auth/manage/update-name",
                      {
                        name: value,
                      },
                    ));
                } catch (e) {
                  axiosErrorToaster(e);
                }
              }}
              cb={() => refreshUserData()}
            />
          </Grid>
          <Grid item>
            <PictureUploader
              cb={() => refreshUserData()}
              endpoint="api/auth/manage/update-profile-picture"
              actionName="Update Profile Picture"
              previewUrls={profilePictureUrl ? [profilePictureUrl] : []}
              deletePicture={{
                fn: () =>
                  server?.axiosInstance
                    .delete("api/auth/manage/profile-picture")
                    .then(() => refreshUserData()),
                deleting: false,
                setDeleting: ((p: boolean) => {}) as TODO,
              }}
            />
          </Grid>
        </Grid>
      </StyledPaper>
    </SettingsTabContainer>
  );
};
