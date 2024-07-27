import { TextField } from "@mui/material";
import { TODO, format } from "@offisito/shared";
import { ChangeEvent } from "react";

interface Options {
  label: string;
  multiline: boolean;
  number: boolean;
  customMinRows: number;
  disabled: boolean;
}

export const renderTextField = <T,>(
  formState: T,
  handleChange: (
    name: keyof T | string[],
    value: string | Date | boolean,
  ) => void,
  path: string[] | keyof T,
  optionalParams: Partial<Options> = {},
) => {
  let value: string | number = formState as TODO;
  let finalKey: string;
  if ((path as TODO)[0].length !== 1) {
    (path as string[]).forEach((key) => {
      value = value && (value as TODO)[key];
    });
    finalKey = (path as TODO)[(path as TODO).length - 1];
  } else {
    value = formState[path as keyof T] as TODO;
    finalKey = path as string;
  }

  const options = {
    ...{
      label: format(finalKey),
      multiline: false,
      number: false,
      customMinRows: 2,
    },
    ...optionalParams,
  };

  return (
    <TextField
      disabled={options.disabled}
      multiline={options.multiline}
      fullWidth={options.multiline}
      minRows={options.multiline ? options.customMinRows : undefined}
      variant="outlined"
      label={options.label}
      value={formState ? value : ""}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        handleChange(path, e.target.value);
      }}
      name={finalKey}
      type={options.number ? "number" : undefined}
    />
  );
};
