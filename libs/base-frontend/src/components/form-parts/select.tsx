import { MenuItem, Select } from "@mui/material";
import { TODO } from "base-shared";

export const renderDropdown = <T,>(
  formState: T,
  handleChange: (
    name: keyof T | string[],
    value: string | Date | boolean,
  ) => void,
  path: keyof T | string[],
  label: string,
  options: { value: string | Date | boolean; label?: string }[],
  disable?: boolean,
) => {
  let lastKey: string;
  let value: string = formState as TODO;
  if ((path as TODO)[0].length !== 1) {
    (path as string[]).forEach((key) => {
      value = value && (value as TODO)[key];
    });
    lastKey = (path as TODO)[(path as TODO).length - 1];
  } else {
    value = formState[path as keyof T] as TODO;
    lastKey = path as string;
  }
  return (
    <Select
      disabled={disable}
      name={lastKey}
      label={label}
      value={(value as TODO)?._id?.toString() || value || options[0].value}
      onChange={(e) => handleChange(path, e.target.value as string)}
    >
      {options.map(
        ({ label, value }) =>
          value && (
            <MenuItem key={value.toString()} value={value as string}>
              {label || (value as string)}
            </MenuItem>
          ),
      )}
    </Select>
  );
};
