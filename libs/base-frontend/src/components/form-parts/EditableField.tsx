'use client';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Grid2, IconButton, TextField, Typography } from '@mui/material';
import { Add, Edit, Save } from '@mui/icons-material';
import { ActionHandler } from '../../types';
import { TODO } from '@the-libs/base-shared';
import { axiosErrorToaster, IconColorer } from '../../utils';

export interface EditableFieldProps<R> {
  name: string;
  value?: string;
  action: ActionHandler<R>;
  cb: () => void;
  plus?: true;
  PrimaryText?: TODO;
}

export const EditableField = <R,>({
  name,
  value,
  action,
  cb,
  plus,
  PrimaryText = Typography,
}: EditableFieldProps<R>) => {
  const [editing, setEditing] = useState<string>();

  return editing !== undefined ? (
    <Grid2 container columnSpacing={2} alignItems="center">
      <Grid2>
        <PrimaryText>{plus ? '+' : ''}</PrimaryText>
      </Grid2>
      <Grid2>
        <TextField
          variant="outlined"
          label={name}
          value={editing}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const target = e.target as HTMLInputElement;
            setEditing(target.value);
          }}
        />
      </Grid2>
      <Grid2>
        <IconButton
          onClick={() =>
            action('', editing)
              .then(() => {
                setEditing(undefined);
                cb();
              })
              .catch((e) => axiosErrorToaster(e))
          }
        >
          <IconColorer>
            <Save />
          </IconColorer>
        </IconButton>
      </Grid2>
    </Grid2>
  ) : (
    <Grid2 container alignItems="center" columnSpacing={2}>
      <Grid2>
        <PrimaryText variant="subtitle1" gutterBottom>
          <strong>{name}: </strong> {plus ? '+' : ''}
          {value}
        </PrimaryText>
      </Grid2>
      <Grid2>
        <IconButton onClick={() => setEditing(value || '')}>
          <IconColorer>{value ? <Edit /> : <Add />}</IconColorer>
        </IconButton>
      </Grid2>
    </Grid2>
  );
};
