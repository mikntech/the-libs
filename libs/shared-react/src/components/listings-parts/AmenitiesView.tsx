import { TODO } from "@offisito/shared";
import { Grid } from "@mui/material";
import { renderAmenityIcon } from "../utils";

interface AmenitiesProps {
  amenities?: TODO;
}

export const AmenitiesView = ({ amenities }: AmenitiesProps) =>
  amenities && (
    <Grid item container justifyItems="center">
      {Object.keys(amenities).map(
        (amenity) =>
          amenities[amenity] && (
            <Grid item key={amenity}>
              {renderAmenityIcon(amenity)}
            </Grid>
          ),
      )}
    </Grid>
  );
