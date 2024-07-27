import {
  AcceptedLeaseType,
  Asset,
  Booking,
  BookingDetails,
  Company,
  format,
  TODO,
} from "@offisito/shared";
import { Grid, Modal } from "@mui/material";
import { Btn, CloseButton, PrimaryText } from "../../styled-components";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ServerContext } from "../../context";
import toast from "react-hot-toast";
import { ActionModal } from "../modals";
import {
  renderDatePicker,
  renderDropdown,
  renderSwitch,
  renderTextField,
} from "../form-parts";
import debounce from "lodash.debounce";
import { axiosErrorToaster } from "../utils";
import { sendMessage } from "../pages";

interface BookingRequestFormProps {
  close: () => void;
  asset?: Asset;
  previousBookingDetails?: BookingDetails;
  readOnly?: boolean;
}

export const BookingRequestForm = ({
  close,
  asset,
  previousBookingDetails,
  readOnly,
}: BookingRequestFormProps) => {
  const [formState, setFormState] = useState<BookingDetails>();
  const server = useContext(ServerContext);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [isBookingInitiated, setIsBookingInitiated] = useState(false);
  const NEW_BOOKING_MESSAGE = `Hello, I'm intrested in ${asset?.assetType}, from ${new Date(formState?.startDate || 0).toLocaleDateString()} until ${new Date(formState?.endDate || 0).toLocaleDateString()} on ${
    formState?.daysInWeek &&
    Object.keys(formState?.daysInWeek)
      .filter((key) =>
        formState?.daysInWeek
          ? formState.daysInWeek[key as keyof typeof formState.daysInWeek]
          : false,
      )
      .join(", ")
  }] '`;

  const initNewBooking = useCallback(
    async (asset: Asset) => {
      if (isBookingInitiated) return;
      setIsBookingInitiated(true);
      const resFound = await server?.axiosInstance.get(
        "api/bookings/draftsByAssetId/" + asset._id,
      );
      if (resFound?.data?.length > 0) {
        setFormState(resFound?.data[0]);
        toast.success("Draft recovered");
      } else {
        const resID = await server?.axiosInstance.post(
          "api/bookings/" + asset._id.toString(),
        );
        resID?.data &&
          setFormState(
            (
              await server?.axiosInstance.get(
                "api/bookings/draftsByBookingId/" + resID.data,
              )
            )?.data[0],
          );
      }
    },
    [server?.axiosInstance, isBookingInitiated],
  );

  useEffect(() => {
    if (asset) initNewBooking(asset);
    if (previousBookingDetails) setFormState(previousBookingDetails);
  }, [asset, previousBookingDetails, initNewBooking]);

  const updateNestedObject = (obj: TODO, path: string[], value: TODO): TODO => {
    if (path.length === 1) {
      obj[path[0]] = value;
      return obj;
    } else {
      if (obj[path[0]] === undefined || typeof obj[path[0]] !== "object") {
        obj[path[0]] = {};
      }
      obj[path[0]] = updateNestedObject(obj[path[0]], path.slice(1), value);
      return obj;
    }
  };

  const handleUpdate = useCallback(
    async (updatedState: Company) => {
      try {
        const res = await server?.axiosInstance.put(
          "/api/bookings/" + updatedState._id.toString(),
          updatedState,
        );
        toast.success(res?.data);
      } catch (error) {
        axiosErrorToaster(error);
      }
    },
    [server?.axiosInstance],
  );

  const debouncedUpdate =
    !readOnly && useMemo(() => debounce(handleUpdate, 500), [handleUpdate]);

  const handleChange = (
    path: string[] | keyof BookingDetails,
    value: string | Date | boolean,
  ) => {
    if (!formState) return;
    const updatedFormState = updateNestedObject(
      { ...formState },
      path[0].length > 0 ? (path as string[]) : [path as keyof BookingDetails],
      value,
    );
    debouncedUpdate && debouncedUpdate(updatedFormState)?.then();
    !readOnly && setFormState(updatedFormState);
  };

  const handleChangePrimitive = (
    name: string,
    value: string | Date | boolean,
  ) => {
    formState &&
      setFormState(((prevState: Company) => {
        const updatedState: Partial<Company> = { ...prevState, [name]: value };
        debouncedUpdate && debouncedUpdate(updatedState as Company)?.then();
        return updatedState;
      }) as TODO);
  };

  const renderDay = (key: string, label: string, readOnly?: boolean) =>
    renderSwitch(formState, handleChange, ["daysInWeek", key], {
      label: { truthy: label },
      disable: readOnly,
    });

  return (
    <Modal open>
      <Grid
        height="80%"
        width="80%"
        marginLeft="10%"
        marginTop="5%"
        padding="2%"
        overflow="scroll"
        item
        container
        direction="column"
        rowSpacing={4}
        alignItems="center"
        wrap="nowrap"
        bgcolor={(theme) => theme.palette.background.default}
      >
        <Grid item>
          <CloseButton onClick={close} />
        </Grid>
        {formState ? (
          <>
            <Grid
              item
              container
              justifyContent="center"
              alignItems="center"
              columnSpacing={1}
            >
              <Grid item>{renderDay("sun", "Sunday", readOnly)}</Grid>
              <Grid item>{renderDay("mon", "Monday", readOnly)}</Grid>
              <Grid item>{renderDay("tues", "Tuesdy", readOnly)}</Grid>
              <Grid item>{renderDay("wed", "Wednesday", readOnly)}</Grid>
              <Grid item>{renderDay("thu", "Thursday", readOnly)}</Grid>
              <Grid item>{renderDay("fri", "Friday", readOnly)}</Grid>
              <Grid item>{renderDay("sat", "Saturday", readOnly)}</Grid>
            </Grid>
            <Grid item>
              {renderDatePicker(
                formState,
                handleChangePrimitive,
                "startDate",
                "Start Date: ",
                readOnly,
              )}
            </Grid>
            <Grid item>
              {renderDatePicker(
                formState,
                handleChangePrimitive,
                "endDate",
                "End Date: ",
                readOnly,
              )}
            </Grid>
            <Grid
              item
              container
              justifyContent="center"
              alignItems="center"
              columnSpacing={2}
            >
              <Grid item>
                <PrimaryText>Lease Type: </PrimaryText>
              </Grid>
              <Grid item>
                {renderDropdown(
                  formState,
                  handleChange,
                  ["leaseType"],
                  "Lease Type: ",
                  Object.values(AcceptedLeaseType).map((value) => ({
                    value,
                    label: value,
                  })),
                  readOnly,
                )}
              </Grid>
            </Grid>
            <Grid item>
              {renderTextField(formState, handleChange, ["contractLength"], {
                number: true,
                label: format("contractLength") + " in months",
                disabled: readOnly,
              })}
            </Grid>
            <Grid item>
              {renderTextField(formState, handleChange, ["note"], {
                multiline: true,
                disabled: readOnly,
              })}
            </Grid>
            {sendModal && (
              <ActionModal
                closeModal={() => setSendModal(false)}
                endpoint={"api/bookings/sendOffer/" + String(formState._id)}
                name="Send to Host"
                doingName="sending to host"
                method="post"
                cb={() => {
                  close();
                  /*  asset?.companyId &&
                    sendMessage(
                       server?.axiosInstance,
                       asset.companyId.toString(),
                       NEW_BOOKING_MESSAGE,
                     );*/
                }}
              />
            )}
            {readOnly ? (
              <>
                <Grid item>
                  <Btn
                    onClick={() => {
                      /*setSendModal(true)*/
                    }}
                  >
                    Approve
                  </Btn>
                </Grid>
                {deleteModal && (
                  <ActionModal
                    closeModal={() => setDeleteModal(false)}
                    endpoint={"api/bookings/" + String(formState._id)}
                    name="Delete"
                    doingName="deleting"
                    method="delete"
                    cb={close}
                  />
                )}
                <Grid item>
                  <Btn color="error" onClick={() => setDeleteModal(true)}>
                    Deny
                  </Btn>
                </Grid>
              </>
            ) : (
              <>
                <Grid item>
                  <Btn
                    onClick={() => {
                      /*setSendModal(true)*/
                    }}
                  >
                    Send this Draft to Host
                  </Btn>
                </Grid>
                {deleteModal && (
                  <ActionModal
                    closeModal={() => setDeleteModal(false)}
                    endpoint={"api/bookings/" + String(formState._id)}
                    name="Delete"
                    doingName="deleting"
                    method="delete"
                    cb={close}
                  />
                )}
                <Grid item>
                  <Btn color="error" onClick={() => setDeleteModal(true)}>
                    Delete this Draft
                  </Btn>
                </Grid>
              </>
            )}
          </>
        ) : (
          <Grid item>
            <PrimaryText>Loading form...</PrimaryText>
          </Grid>
        )}
      </Grid>
    </Modal>
  );
};
