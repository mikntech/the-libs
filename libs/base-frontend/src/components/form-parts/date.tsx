import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export const renderDatePicker = <T,>(
  formState: T,
  handleChange: (name: keyof T, value: string | Date | boolean) => void,
  name: keyof T,
  label: string,
  disabled?: boolean,
  initializeFormStateKey?: boolean,
) => {
  const value = () => {
    if (!formState || !formState[name]) {
      if (initializeFormStateKey) handleChange(name, new Date());
      return dayjs(new Date());
    }
    return dayjs(new Date(formState[name] as unknown as Date));
  };

  // INFO: old value function to fallback to, in case of catastrophe
  // const value = () => {
  //   return dayjs(
  //     formState && formState[name]
  //       ? new Date(
  //           formState ? (formState[name] as unknown as Date) : Date.now(),
  //         )
  //       : new Date(),
  //   );
  // }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        disabled={disabled}
        label={label}
        value={value()}
        onChange={(newDate) =>
          handleChange(name, newDate ? new Date(newDate.valueOf()) : new Date())
        }
        name={name as string}
      />
    </LocalizationProvider>
  );
};
