import { FC, useState } from 'react';
import { Button, Grid, SxProps, Modal } from '@mui/material';

export type ForClose = (f: false) => void;
export const CloseButton = (forClose: ForClose) => (
  <Grid>
    <Button variant="contained" color="error" onClick={() => forClose(false)}>
      X
    </Button>
  </Grid>
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
  HighOrderComponent: FC<{ close: () => void }>;
  forClose: ForClose;
}

const TheModal = ({ forClose, HighOrderComponent }: TheModalProps) => {
  return (
    <Grid
      container
      direction="column"
      rowSpacing={4}
      sx={containerSx(60, 80)}
      alignItems="center"
      wrap="nowrap"
    >
      {CloseButton(forClose)}
      <HighOrderComponent
        close={() => {
          forClose(false);
        }}
      />
    </Grid>
  );
};

export const useModal = (
  HOC: TheModalProps['HighOrderComponent'],
): [FC, () => void, { close: () => void; isOpen: boolean }] => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return [
    () =>
      isModalOpen && (
        <Modal open={true}>
          <TheModal forClose={setIsModalOpen} HighOrderComponent={HOC} />
        </Modal>
      ),
    () => setIsModalOpen(true),
    { close: () => setIsModalOpen(false), isOpen: isModalOpen },
  ];
};
