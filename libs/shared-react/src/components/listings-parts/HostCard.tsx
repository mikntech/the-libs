import { useCallback, useContext, useEffect, useState } from "react";
import { PrimaryText, ServerContext } from "../../";
import { Avatar, Grid } from "@mui/material";
import { parseISO, differenceInMonths } from "date-fns";

interface HostCardPRops {
  companyId: string;
}

export const HostCard = ({ companyId }: HostCardPRops) => {
  const server = useContext(ServerContext);
  const [data, setData] = useState<{
    hostName: string;
    companyName: string;
    hostCreateDate: string;
    pictureUrl: string;
  }>();

  const fetchData = useCallback(
    async (companyId: string) => {
      const res = await server?.axiosInstance.get(
        "api/search/hostData/" + companyId,
      );
      if (res?.data) setData(res?.data);
    },
    [server?.axiosInstance],
  );

  useEffect(() => {
    fetchData(companyId);
  }, [fetchData, companyId]);

  return (
    data && (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        columnSpacing={2}
        wrap="nowrap"
      >
        <Grid item>
          <Avatar alt={data.hostName || "username"} src={data.pictureUrl}>
            {data.hostName ? data.hostName[0] : "?"}
          </Avatar>
        </Grid>
        <Grid item container direction="column" rowSpacing={1}>
          <Grid item>
            <PrimaryText>
              <b>Hosted by {data.hostName}</b> ({data.companyName})
            </PrimaryText>
          </Grid>
          <Grid item>
            <PrimaryText>
              {differenceInMonths(new Date(), parseISO(data.hostCreateDate))}{" "}
              Months of hosting
            </PrimaryText>
          </Grid>
        </Grid>
      </Grid>
    )
  );
};
