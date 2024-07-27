import { Grid, Modal } from "@mui/material";
import { axiosErrorToaster } from "../utils";
import { ReactNode, useContext, useState } from "react";
import { ServerContext } from "../../context";
import { Btn, PrimaryText } from "../../styled-components";
import toast from "react-hot-toast";
import { TODO } from "@offisito/shared";

interface ActionModalProps<B> {
  closeModal: () => void;
  endpoint: string | (() => void);
  name: string | ReactNode;
  doingName: string;
  method: "post" | "put" | "patch" | "delete";
  body?: B;
  cb?: () => void;
}

export const ActionModal = <B = TODO,>({
  closeModal,
  endpoint,
  name,
  doingName,
  method,
  body,
  cb,
}: ActionModalProps<B>) => {
  const server = useContext(ServerContext);
  const [deleting, setDeleting] = useState(false);

  const handleAction = async () => {
    setDeleting(true);
    try {
      if (typeof endpoint === "string") {
        const config = {
          method: method,
          url: endpoint,
          data: body,
          ...(body ? { data: body } : {}),
        };
        await server?.axiosInstance?.request(config);
        toast.success("Success");
      } else endpoint();
    } catch (error) {
      axiosErrorToaster(error);
    } finally {
      closeModal();
      setDeleting(false);
      cb && cb();
    }
  };

  return (
    <Modal open>
      <Grid
        container
        height="100%"
        bgcolor={(theme) => theme.palette.background.default}
        direction="column"
        justifyContent="center"
        alignItems="center"
        rowSpacing={2}
      >
        <Grid item>
          <PrimaryText variant="h4">Are you sure?</PrimaryText>
        </Grid>
        <Grid
          item
          container
          justifyContent="center"
          alignItems="center"
          columnSpacing={2}
        >
          <Grid item>
            {deleting ? (
              <Btn disabled>{doingName}</Btn>
            ) : (
              <Btn onClick={handleAction}>{name}</Btn>
            )}
          </Grid>
          <Grid item>
            <Btn onClick={() => closeModal()}>cancel</Btn>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
};
