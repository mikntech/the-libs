import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export const renderDatePicker = <T,>(
  formState: T,
  handleChange: (name: keyof T, value: string | Date | boolean) => void,
  name: keyof T,
  label: string,
  disabled?: boolean,
) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      disabled={disabled}
      label={label}
      value={dayjs(
        formState && formState[name]
          ? new Date(
              formState ? (formState[name] as unknown as Date) : Date.now(),
            )
          : new Date(),
      )}
      onChange={(newDate) =>
        handleChange(name, newDate ? new Date(newDate.valueOf()) : new Date())
      }
      name={name as string}
    />
  </LocalizationProvider>
);
