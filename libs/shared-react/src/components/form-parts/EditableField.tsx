import { ChangeEvent, useState } from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import { Add, Edit, Save } from "@mui/icons-material";
import { axiosErrorToaster, IconColorer } from "..";
import { PrimaryText } from "../../styled-components";
import { ActionHandler } from "../../types";

export interface EditableFieldProps<R> {
  name: string;
  value?: string;
  action: ActionHandler<R>;
  cb: () => void;
  plus?: true;
}

export const EditableField = <R,>({
  name,
  value,
  action,
  cb,
  plus,
}: EditableFieldProps<R>) => {
  const [editing, setEditing] = useState<string>();

  return editing !== undefined ? (
    <Grid container columnSpacing={2} alignItems="center">
      <Grid item>
        <PrimaryText>{plus ? "+" : ""}</PrimaryText>
      </Grid>
      <Grid item>
        <TextField
          variant="outlined"
          label={name}
          value={editing}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setEditing(e.target.value);
          }}
        />
      </Grid>
      <Grid item>
        <IconButton
          onClick={() =>
            action("", editing)
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
      </Grid>
    </Grid>
  ) : (
    <Grid container alignItems="center" columnSpacing={2}>
      <Grid item>
        <PrimaryText variant="subtitle1" gutterBottom>
          <strong>{name}: </strong> {plus ? "+" : ""}
          {value}
        </PrimaryText>
      </Grid>
      <Grid item>
        <IconButton onClick={() => setEditing(value || "")}>
          <IconColorer>{value ? <Edit /> : <Add />}</IconColorer>
        </IconButton>
      </Grid>
    </Grid>
  );
};
