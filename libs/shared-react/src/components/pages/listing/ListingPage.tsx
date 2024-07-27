import { Avatar, Box, Divider, Grid, Typography } from "@mui/material";
import { ImageCarousel } from "./ImageCarousel";
import { LocationOn, Message } from "@mui/icons-material";
import { Btn, PrimaryText } from "../../../styled-components";
import { Asset,formatAddress } from "@offisito/shared";
import {AllOfficeAmenities} from '../../listings-parts'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useEffect, useState, useContext } from "react";
import {
  BookingRequestForm,
  getAmenityIcon,
  HostCard,
  IconColorer,
  mock1,

} from "../../../";
import SendMessageForm from "../../forms/SendMessageForm";
import { ResultsMap } from "../../";
import { useNavigate } from "react-router-dom";
import { ServerContext } from "../../../context";



interface ListingPageProps {
  space: Asset;
}

export const ListingPage = ({ space }: ListingPageProps) => {
  const server = useContext(ServerContext)
  const [company, setCompany]= useState<any>(null)
  const [modal, setModal] = useState<"" | "book" | "amenities">("");

  useEffect(() => {

    const fetchComapny = async ()=>
    {
      let data=null
      try
      {
         data = await server?.axiosInstance.get(
          'api/host/companies/get_company_lease/'+space.companyId
        )
      }
      catch (c:any)
      {
        console.log(c.message)
      }

      return data?.data
    }

    setCompany(fetchComapny())
  }, []);

  useEffect(() => {

    const adjustHeight = () => {
      const x = document.getElementById("rmap");
      if (x)
        x.style.height =
          document.getElementById("asd")?.offsetWidth + "px" || "0px";
    };
    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, []);



  const renderModal = () => {
    switch (modal) {
      case "book":
        return <BookingRequestForm close={() => setModal("")} asset={space} />;
      case "amenities":
        return null;
      case "":
        return (
          <SendMessageForm
            id={String(space.companyId)}
            amIaGuest
            spaceId={String(space._id)}
            close={() => setModal("")}
          />
        );
    }
  };

  const navigate = useNavigate();

  return space ? (

    <Grid
      width="100%"
      height="100%"
      container
      direction="column"
      justifyContent="space-between"
      wrap="nowrap"
      overflow="hidden"
    >

      <Avatar  onClick={() => navigate("/")}  sx={{cursor:'pointer', bgcolor:'white',zIndex:9999,color:'black',marginLeft:2,marginTop:1, position:"fixed",width: 24, height: 24,  left:0}}>
       <ArrowBackIosNewIcon sx={{width:12, height:12}} />
      </Avatar>

      <Grid
        item
        container
        width="100%"
        direction="column"
        overflow="scroll"
        rowSpacing={2}
        wrap="nowrap"
      >
        {modal && renderModal()}
        <Grid item width="100%">
          <ImageCarousel
            imagesArray={
              space.photoURLs?.map((url, index) => ({
                label: `Photo${index + 1}`,
                alt: `Photo${index + 1}`,
                imgPath: url,
              }
              
            )) || [{ label: "Photo1", alt: "Photo1", imgPath: mock1 }]
            }
            imageHeight={160}
          />
        </Grid>
        
        <Grid  paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
        <Typography>Office Amenities:</Typography>
        {space.assetAmenities && <AllOfficeAmenities accessedAmenities={space.assetAmenities}/>}
        </Grid>

        <Grid  paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <PrimaryText  color="text.secondary" >{space.assetDescription}</PrimaryText>
        </Grid>

        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <PrimaryText  variant="h5">
          {space.assetType} {space.roomNumber} {space.floorNumber ? `F(${space.floorNumber})` : ''}
          </PrimaryText>
        </Grid>

        {space.address && (
          <Grid
            paddingLeft="16px"
            paddingRight="16px"
            paddingTop="8px" 
            container
            alignItems="center"
            wrap="nowrap"
          >
            <Grid item>
              <LocationOn color="primary" />
            </Grid>
            <Grid>
            <PrimaryText fontSize={14} marginBottom={'4px'}  fontWeight={400}  color="text.secondary">
            {formatAddress(space.address)}
            </PrimaryText>
            </Grid>
          </Grid>
        )}
        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <Divider />
        </Grid>
        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <HostCard companyId={String(space.companyId)} />
        </Grid>
        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <Divider />
        </Grid>

        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <Divider />
        </Grid>
        <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
          <PrimaryText variant="h5">Your offisito location</PrimaryText>
        </Grid>
        {/* {space.address && (
          <Grid paddingTop="8px"  paddingLeft="16px" paddingRight="16px">
            <PrimaryText>
            {formatAddress(space.address)}
            </PrimaryText>
          </Grid>
        )} */}
        <Grid paddingTop="8px"  width="100%" id="asd" paddingLeft="16px" paddingRight="16px">
          <ResultsMap setMap={() => {}} assets={[space]} single />
        </Grid>
      </Grid>
      <Grid
        item
        width="100%"
        container
        justifyContent="center"
        alignItems="center"
        columnSpacing={2}
        paddingTop="10px"
        paddingBottom="10px"
        paddingLeft="16px"
        paddingRight="16px"
        wrap="nowrap"
      >
        <Grid
          item
          width="67%"
          container
          justifyContent="center"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item>
            <Btn onClick={() => navigate(`/listingform/${String(space._id)}`)}>
              Book Space WIP
            </Btn>
          </Grid>
          <Grid item>
            <Btn onClick={() => setModal("book")}>Book Space</Btn>
          </Grid>
        </Grid>
        <Grid
          item
          width="33%"
          container
          justifyContent="center"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item>
            <Btn onClick={() => navigate("/chats?chatId=" + String(space._id))}>
              <Message />
            </Btn>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <PrimaryText>Loading Listing...</PrimaryText>
  );
};
