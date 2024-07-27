import styled from "@emotion/styled";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import {
  ArrowDropDownIcon,
  DateCalendar,
  LocalizationProvider,
  PickersCalendarHeaderProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TODO } from "@offisito/shared";
import { Dayjs } from "dayjs";
import { useEffect } from "react";

const CustomCalendarHeaderRoot = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 16px",
  alignItems: "center",
});

const CustomCalendarHeader = (props: PickersCalendarHeaderProps<Dayjs>) => {
  const { currentMonth, onMonthChange, onViewChange } = props;

  const selectNextMonth = () =>
    onMonthChange(currentMonth.add(1, "month"), "left");

  const selectNextYear = () =>
    onMonthChange(currentMonth.add(1, "year"), "left");

  const selectPreviousMonth = () =>
    onMonthChange(currentMonth.subtract(1, "month"), "right");

  const selectPreviousYear = () =>
    onMonthChange(currentMonth.subtract(1, "year"), "right");

  return (
    <CustomCalendarHeaderRoot>
      <Stack direction="row" alignItems="center">
        <IconButton onClick={selectPreviousMonth} title="Previous month">
          <ChevronLeft />
        </IconButton>
        <Typography variant="body2">{currentMonth.format("MMM")}</Typography>
        <IconButton
          title="switch to month view"
          onClick={() => {
            onViewChange && onViewChange("month");
          }}
        >
          <ArrowDropDownIcon />
        </IconButton>
        <IconButton onClick={selectNextMonth} title="Next month">
          <ChevronRight />
        </IconButton>
      </Stack>
      <Stack direction="row" alignItems="center">
        <IconButton onClick={selectPreviousYear} title="Previous year">
          <ChevronLeft />
        </IconButton>
        <Typography variant="body2">{currentMonth.format("YYYY")}</Typography>
        <IconButton
          title="switch to year view"
          onClick={() => {
            onViewChange && onViewChange("year");
          }}
        >
          <ArrowDropDownIcon />
        </IconButton>
        <IconButton onClick={selectNextYear} title="Next year">
          <ChevronRight />
        </IconButton>
      </Stack>
    </CustomCalendarHeaderRoot>
  );
};

export const HostBookingDateCalendar = (HostBookingDateCalendar: TODO) => {
  useEffect(() => {
    console.log("HostBookingDateCalendar", HostBookingDateCalendar);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        // value={HostBookingDateCalendar}
        slots={{ calendarHeader: CustomCalendarHeader }}
        slotProps={{ calendarHeader: { sx: { border: "1px red solid" } } }}
        // readOnly
      />
    </LocalizationProvider>
  );
};
