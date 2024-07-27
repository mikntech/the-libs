import { TODO } from "@offisito/shared";
import { format } from "date-fns";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./HostBookingDayPicker.css";
import {
  ArrowDropDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@mui/x-date-pickers";
import { Button } from "@mui/material";

interface YearLimit {
  fromYear: number;
  toYear: number;
}

const CustomDropdownComponent = (
  props: TODO,
  yearLimit: YearLimit,
): JSX.Element => {
  const { onChange, value, children, caption, className, style } = props;
  const dayPicker: TODO = useDayPicker();
  const { goToMonth, nextMonth, previousMonth, goToDate, currentMonth } =
    useNavigation() as TODO;

  const previousYear = new Date(
    new Date(currentMonth).setFullYear(currentMonth.getFullYear() - 1),
  );
  const nextYear = new Date(
    new Date(currentMonth).setFullYear(currentMonth.getFullYear() + 1),
  );

  return (
    <section style={{ display: "flex", alignItems: "center" }}>
      <Button
        disabled={
          props.name === "years"
            ? previousYear.getFullYear() < yearLimit.fromYear
            : !previousMonth
        }
        sx={{
          padding: "0px",
          margin: "0px",
          border: "0px",
          backgroundColor: "inherit",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "48px",
          minWidth: "48px",
          height: "48px",
          color: "black",
          borderRadius: "100%",
          "&:hover": {
            backgroundColor: "darkGray",
          },
        }}
        onClick={() => {
          if (props.name === "years" && value !== undefined && !isNaN(+value)) {
            goToDate(previousYear);
          } else {
            previousMonth && goToMonth(previousMonth);
          }
        }}
      >
        <ArrowLeftIcon sx={{ padding: "8px" }} />
      </Button>
      <div className={className} style={style}>
        <span className={dayPicker.classNames.vhidden}>
          {props["aria-label"]}
        </span>
        <select
          name={props.name}
          aria-label={props["aria-label"]}
          className={dayPicker.classNames.dropdown}
          style={dayPicker.styles.dropdown}
          value={value}
          onChange={onChange}
        >
          {children}
        </select>
        <div
          className={dayPicker.classNames.caption_label}
          style={dayPicker.styles.caption_label}
          aria-hidden="true"
        >
          <span
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.1px",
              fontFamily: "Roboto",
              fontWeight: "500",
              width: props.name === "years" ? "33px" : "26px",
            }}
          >
            {props.name === "years" ? caption : format(currentMonth, "MMM")}
          </span>
          <ArrowDropDownIcon sx={{ width: "18px", height: "18px" }} />
        </div>
      </div>
      <Button
        disabled={
          props.name === "years"
            ? nextYear.getFullYear() > yearLimit.toYear
            : !nextMonth
        }
        sx={{
          padding: "0px",
          margin: "0px",
          border: "0px",
          backgroundColor: "inherit",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "48px",
          minWidth: "48px",
          height: "48px",
          color: "black",
          borderRadius: "100%",
          "&:hover": {
            backgroundColor: "darkGray",
          },
        }}
        onClick={() => {
          if (props.name === "years" && value !== undefined && !isNaN(+value)) {
            goToDate(nextYear);
          } else {
            nextMonth && goToMonth(nextMonth);
          }
        }}
      >
        <ArrowRightIcon sx={{ padding: "8px" }} />
      </Button>
    </section>
  );
};

const modifiers = (bookingDates: TODO) => {
  const booking_start = bookingDates.map(
    (bookingDate: TODO) => new Date(bookingDate.from),
  );

  const booking_end = bookingDates.map(
    (bookingDate: TODO) => new Date(bookingDate.to),
  );

  // TODO: booking_middle, use link: https://stackoverflow.com/questions/2698725/comparing-date-part-only-without-comparing-time-in-javascript
  //     for research on proper handling of date comparisons

  return {
    booked: bookingDates,
    booking_start: booking_start,
    booking_end: booking_end,
  };
};

const modifiersClassNames = {
  booked: "booked",
  booking_start: "booking_start",
  booking_end: "booking_end",
};

const modifiersStyles = {
  today: {
    color: "red",
  },
  booked: {
    backgroundColor: "#005FAF",
    color: "#fff",
    borderRadius: "0px",
  },
  booking_start: {
    borderTopLeftRadius: "100%",
    borderBottomLeftRadius: "100%",
    maxWidth: "44px",
    marginInlineStart: "4px",
    // borderTopRightRadius: "0px",
    // borderBottomRightRadius: "0px",
  },
  booking_end: {
    borderTopRightRadius: "100%",
    borderBottomRightRadius: "100%",
    maxWidth: "44px",
    marginInlineEnd: "4px",
    // borderTopLeftRadius: "0px",
    // borderBottomLeftRadius: "0px",
  },
  caption: {
    justifyContent: "space-between",
  },
};

const styles = {
  months: {
    justifyContent: "center",
  },
  caption: {
    height: "64px",
  },
  caption_label: {
    gap: "8px",
    padding: "10px 4px 10px 8px",
    border: "0px",
  },
  caption_dropdowns: {
    width: "100%",
    justifyContent: "space-between",
  },
  day: {
    fontFamily: "Roboto",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: "400",
    letterSpacing: "0.5px",
    width: "48px",
    maxWidth: "48px",
    // borderRight: "4px solid transparent",
    // borderLeft: "4px solid transparent",
    // height: "48px",
  },
  cell: {
    width: "48px",
    height: "48px",
    // borderTop: "4px solid transparent",
    // borderBottom: "4px solid transparent",
    // paddingBlock: "4px",
  },
  row: {
    // margin: "4px",
  },
  head_cell: {
    fontFamily: "Roboto",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: "400",
    letterSpacing: "0.5px",
    height: "48px",
  },
  table: {
    margin: "0px 12px 4px 12px",
  },
};

const formatWeekdayName: TODO = (date: TODO, options: TODO) => {
  return format(date, "EEEEE", options);
};

export const HostBookingDayPicker = ({ bookingDates }: TODO) => {
  const yearLimit = {
    fromYear: 2010,
    toYear: 2026,
  };

  // TODO: include theme from the day/night app theme
  // TODO: consider possibilities of moore than one booking in one day

  // useEffect(() => {
  // console.log("bookingDates", bookingDates);
  // }, []);

  return (
    <DayPicker
      components={{
        Dropdown: (props) => CustomDropdownComponent(props, yearLimit),
      }}
      captionLayout="dropdown"
      fromYear={yearLimit.fromYear}
      toYear={yearLimit.toYear}
      styles={styles}
      modifiers={modifiers(bookingDates)}
      modifiersClassNames={modifiersClassNames}
      modifiersStyles={modifiersStyles}
      // selected={bookingDates}
      formatters={{ formatWeekdayName }}
    />
  );
};
