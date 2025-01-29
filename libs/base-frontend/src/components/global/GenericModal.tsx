import { ReactNode, useState } from 'react';
import { Button, Grid2, SxProps, Modal } from '@mui/material';

export type ForClose = (f: false) => void;
export const CloseButton = (forClose: ForClose) => (
  <Grid2>
    <Button variant="contained" color="error" onClick={() => forClose(false)}>
      X
    </Button>
  </Grid2>
);

export const containerSx = (
  width = 80,
  height = 90,
  bgcolor = '#EEEEEE',
): SxProps => ({
  marginLeft: (100 - width) / 2 + 'vw',
  marginTop: (100 - height) / 2 + 'vh',
  paddingTop: (100 - height) / 2 + 'vh',
  paddingBottom: (100 - height) / 2 + 'vh',
  height: height + 'vh',
  width: width + 'vw',
  bgcolor,
  overflow: 'scroll',
});

interface TheModalProps {
  gridItems: ReactNode;
  forClose: ForClose;
}

const TheModal = ({ forClose, gridItems }: TheModalProps) => {
  return (
    <Grid2
      container
      direction="column"
      rowSpacing={4}
      sx={containerSx(60, 80)}
      alignItems="center"
      wrap="nowrap"
    >
      {CloseButton(forClose)}
      {gridItems}
    </Grid2>
  );
};

export const GenericModal = (props: Omit<TheModalProps, 'forClose'>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    isModalOpen && (
      <Modal open={true}>
        <TheModal forClose={setIsModalOpen} {...props} />
      </Modal>
    )
  );
};
