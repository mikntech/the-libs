
import { AccessedAmenity  } from "@offisito/shared";
import {IconSelector} from './IconSelector'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FC,useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box,IconButton   } from '@mui/material';
import {PrimaryText } from "../../styled-components";




interface AllOfficeAmenitiesProps {
    accessedAmenities: AccessedAmenity[] ;
}

export const AllOfficeAmenities:FC<AllOfficeAmenitiesProps>= ({accessedAmenities}) => {
  const [showLimited, setShowLimited] = useState(true);
  const amenitiesToShow = showLimited ? accessedAmenities.slice(0, 4) : accessedAmenities;
  return (
  <Box width={'100%'}   sx={{display: "flex",alignItems: "baseline",  }}>
    <Grid
    container
    columns={12}
    columnSpacing={2}
    rowSpacing={1}
    alignItems="center"
    flexDirection="row"
    width={'100%'}
    >
      {(amenitiesToShow).map(({ name }) => (
      <Grid  key={name} xs={3} sm={3} md={3} sx={
        {
          display:'flex',
          flexDirection: "row",
          alignItems: "center",
          gap:1,
          // border: '1px solid #ccc'
        }
      }>
        <IconSelector iconName={name} />
        <PrimaryText noWrap fontSize="70%">{name}</PrimaryText>
      </Grid>
      ))}
    </Grid>

    {accessedAmenities.length>4 && (<IconButton sx={{
    transform : showLimited? 'rotate(0deg)' : 'rotate(180deg)',
    padding:0,
    marginLeft:'auto',
    marginRight:'5px'
    }} 
    onClick={()=>setShowLimited(!showLimited)}>
        <ExpandMoreIcon />
    </IconButton>
    )}
  </Box>
  );
}
