import { Asset, formatAddress } from "@offisito/shared";
import { Box, Grid } from "@mui/material";
import { PrimaryText } from "../../styled-components";
import { useNavigate } from "react-router-dom";
import { getAmenityIcon, mock1 } from "../../assets";
import { ImageCarousel } from "../";

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard = ({ asset }: AssetCardProps) => {
  const navigate = useNavigate();

  return (
    <Grid
      container
      direction="column"
      width="96%"
      marginLeft="2%"
      rowSpacing={2}
      onClick={() => navigate("/?space=" + asset._id.toString())}
      borderRadius="10px"
      style={{ cursor: "pointer" }}
      height={400}
    >
      <Grid item width="100%" marginTop="-16px">
        <ImageCarousel
          imagesArray={
            asset.photoURLs?.map((url, index) => ({
              label: `Photo${index + 1}`,
              alt: `Photo${index + 1}`,
              imgPath: url,
            })) || [{ label: "Photo1", alt: "Photo1", imgPath: mock1 }]
          }
          imgprops={{ borderRadius: "10px 10px 0 0" }}
        />
      </Grid>
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        wrap="nowrap"
        width="100%"
        padding="4%"
      >
        <Grid item container width="100%" direction="column">
          <Grid item>
            <PrimaryText>
              <b>
                {asset.assetType} {asset.roomNumber}
              </b>
            </PrimaryText>
          </Grid>
          {asset.address && (
            <Grid item width="100%">
              <PrimaryText>{formatAddress(asset.address)}</PrimaryText>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        wrap="nowrap"
        width="100%"
        padding="4%"
      >
        <Grid item container alignItems="center" columnSpacing={2} width="60%">
          {asset.assetAmenities?.map((amenity, index) => (
            <Grid item key={index}>
              {getAmenityIcon(amenity.name) ? (
                <Box component="img" src={getAmenityIcon(amenity.name)} />
              ) : (
                <PrimaryText>{amenity.name}</PrimaryText>
              )}
            </Grid>
          ))}
        </Grid>
        <Grid
          item
          container
          justifyContent="center"
          alignItems="center"
          width="40%"
          columnSpacing={1}
        >
          <Grid item>
            <PrimaryText color="primary">
              {asset.leaseCondition?.monthlyPrice}$
            </PrimaryText>
          </Grid>
          <Grid item>
            <PrimaryText sx={{ opacity: "50%" }}> Month</PrimaryText>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
