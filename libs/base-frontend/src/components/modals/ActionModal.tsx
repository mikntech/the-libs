import { Button, Grid, Modal, Typography } from '@mui/material';
import { ReactNode, useContext, useState } from 'react';
import { ServerContext } from '../../context';
import toast from 'react-hot-toast';
import { TODO } from '@the-libs/base-shared';
import { axiosErrorToaster } from '../../utils';

interface ActionModalProps<B> {
  closeModal: () => void;
  endpoint: string | (() => void);
  name: string | ReactNode;
  doingName: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  PrimaryText?: TODO;
  Btn?: TODO;
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
  PrimaryText = Typography,
  Btn = Button,
}: ActionModalProps<B>) => {
  const server = useContext(ServerContext);
  const [deleting, setDeleting] = useState(false);

  const handleAction = async () => {
    setDeleting(true);
    try {
      if (typeof endpoint === 'string') {
        const config = {
          method: method,
          url: endpoint,
          data: body,
          ...(body ? { data: body } : {}),
        };
        await server?.axiosInstance?.request(config);
        toast.success('Success');
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
        <Grid>
          <PrimaryText variant="h4">Are you sure?</PrimaryText>
        </Grid>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          columnSpacing={2}
        >
          <Grid>
            {deleting ? (
              <Btn disabled>{doingName}</Btn>
            ) : (
              <Btn onClick={handleAction}>{name}</Btn>
            )}
          </Grid>
          <Grid>
            <Btn onClick={() => closeModal()}>cancel</Btn>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
};
