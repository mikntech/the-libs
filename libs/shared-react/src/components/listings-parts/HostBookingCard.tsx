import { Card, CardContent } from "@mui/material";
import { stockCatForDev } from "../../assets/images/free";
import { Img } from "../utils";
import { Asset, Booking, TODO } from "@offisito/shared";
import { arrowUp } from "../../assets";
import { HostBookingDateCalendar } from "./HostBookingDateCalendar";
import dayjs from "dayjs";
import { HostBookingDayPicker } from "./HostBookingDayPicker";

export const HostBookingCard = ({
  booking,
  relatedBookings,
  asset,
  handleOnClick,
  cardIndex,
  isSelected,
}: {
  booking: Booking;
  relatedBookings: Booking[];
  asset: Asset;
  handleOnClick: TODO;
  cardIndex: number;
  isSelected: boolean;
}) => {
  const getDatesOfRelatedBookings = () => {
    const dates = relatedBookings
      .filter((booking) => {
        return booking.startDate && booking.endDate;
      })
      .map((booking) => {
        return { from: booking.startDate, to: booking.endDate };
      });
    return dates;
  };

  return (
    <>
      <Card
        sx={{
          marginBlockStart: "24px",
          display: "flex",
          width: "100%",
          backgroundColor: "#F9F9FF",
          borderRadius: "12px",
        }}
      >
        <Img
          src={stockCatForDev}
          alt="office"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
          }}
        ></Img>
        <CardContent
          sx={{
            display: "flex",
            width: "100%",
            padding: "0",
            overflow: "hidden",
            borderTop: "1px solid #C3C6CF",
            borderRight: "1px solid #C3C6CF",
            borderBottom: "1px solid #C3C6CF",
          }}
          style={{
            paddingBottom: "0",
          }}
        >
          <section
            style={{
              display: "flex",
              gap: "15px",
              width: "100%",
              overflow: "hidden",
              padding: "15px",
            }}
          >
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <p
                style={{
                  marginBlockStart: 0,
                  marginBlockEnd: 0,
                  color: "#191C20",
                  fontSize: "16px",
                  fontFamily: "Roboto",
                  fontWeight: "500",
                  lineHeight: "24px",
                  letterSpacing: 0.15,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {asset.roomNumber} F{asset.floorNumber}
              </p>
              <p
                style={{
                  marginBlockStart: 0,
                  marginBlockEnd: 0,
                  color: "#191C20",
                  fontSize: "14px",
                  fontFamily: "Roboto",
                  fontWeight: "400",
                  lineHeight: "20px",
                  letterSpacing: 0.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Booked:{" "}
                <span
                  style={{
                    fontFamily: "Roboto",
                    fontWeight: "700",
                  }}
                >
                  16-19 Apr. - 2023
                </span>
              </p>
            </section>
            <section style={{ display: "flex", alignItems: "center" }}>
              <Img
                src={arrowUp}
                alt="ArrowUp"
                height="16px"
                width="16px"
                style={{
                  cursor: "pointer",
                }}
                onClick={(ev) => handleOnClick(ev, cardIndex, asset._id)}
              ></Img>
            </section>
          </section>
        </CardContent>
      </Card>

      {isSelected && (
        <section style={{ backgroundColor: "gray", width: "100%" }}>
          {/* <p>cardIndex={cardIndex}</p>
          <p>booking key: {String(booking._id)}</p>
          <p>assetId={String(asset._id)}</p>

          <p>relatedBookings:</p>
          <ul>
            {relatedBookings.map((booking) => (
              <li key={String(booking._id)}>
                <p>booking key: {String(booking._id)}</p>
                <p>start date: {String(booking.startDate)}</p>
                <p>end date: {String(booking.endDate)}</p>
              </li>
            ))}
          </ul> */}
          {/* <HostBookingDateCalendar bookingDates={getDatesOfRelatedBookings()} /> */}
          <HostBookingDayPicker bookingDates={getDatesOfRelatedBookings()} />
        </section>
      )}
    </>
  );
};

// ********* use below for rendering json of objects "booking" and "asset" *********
// export const HostBookingCard = ({
//   booking,
//   asset,
// }: {
//   booking: Booking;
//   asset: Asset;
// }) => {
//   return (
//     <div>
//       <pre style={{ color: "gray" }}>
//         Booking -- {JSON.stringify(booking, null, 2)}
//       </pre>
//       <pre style={{ color: "gray" }}>
//         Asset -- {JSON.stringify(asset, null, 2)}
//       </pre>
//       <Card
//         sx={{
//           marginBlockStart: "24px",
//           display: "flex",
//           width: "100%",
//           backgroundColor: "#F9F9FF",
//           borderRadius: "12px",
//         }}
//       >
//         <Img
//           src={stockCatForDev}
//           alt="office"
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//           }}
//         ></Img>
//         <CardContent
//           sx={{
//             display: "flex",
//             width: "100%",
//             padding: "0",
//             overflow: "hidden",
//             borderTop: "1px solid #C3C6CF",
//             borderRight: "1px solid #C3C6CF",
//             borderBottom: "1px solid #C3C6CF",
//           }}
//           style={{
//             paddingBottom: "0",
//           }}
//         >
//           <section
//             style={{
//               padding: "15px",
//               display: "flex",
//               flexDirection: "column",
//               gap: "4px",
//               overflow: "hidden",
//               width: "100%",
//             }}
//           >
//             <section>
//               <p
//                 style={{
//                   marginBlockStart: 0,
//                   marginBlockEnd: 0,
//                   color: "#191C20",
//                   fontSize: "16px",
//                   fontFamily: "Roboto",
//                   fontWeight: "500",
//                   lineHeight: "24px",
//                   letterSpacing: 0.15,
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {asset.roomNumber} F{asset.floorNumber}
//               </p>
//             </section>
//             <section style={{ overflow: "hidden" }}>
//               <p
//                 style={{
//                   marginBlockStart: 0,
//                   marginBlockEnd: 0,
//                   color: "#191C20",
//                   fontSize: "14px",
//                   fontFamily: "Roboto",
//                   fontWeight: "400",
//                   lineHeight: "20px",
//                   letterSpacing: 0.25,
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 Booked:{" "}
//                 <span
//                   style={{
//                     fontFamily: "Roboto",
//                     fontWeight: "700",
//                   }}
//                 >
//                   16-19 Apr. - 2023
//                 </span>
//               </p>
//             </section>
//           </section>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
