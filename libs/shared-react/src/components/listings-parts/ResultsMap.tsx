import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Grid } from "@mui/material";
import { Asset } from "@offisito/shared";

import AddressIcon from "./office.svg";
import { findMe } from "../../utils";
import { Btn } from "../../styled-components";

const custoMicon = L.icon({
  iconUrl: AddressIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface ResultsMapProps {
  setMap: Dispatch<SetStateAction<boolean>>;
  assets: Asset[] | undefined;
  single?: true;
}

export const ResultsMap = ({ setMap, assets, single }: ResultsMapProps) => {
  const [myLocation, setMyLocation] = useState({
    lat: 40.71908450000001,
    lng: -74.0712621,
  });

  useEffect(() => {
    findMe().then((l) => l && setMyLocation({ lat: l.lat, lng: l.lng }));
  }, []);

  useEffect(() => {
    const initialMap = L.map("rmap", {
      center:
        single && assets
          ? [
              assets[0].location.coordinates[1],
              assets[0].location.coordinates[0],
            ]
          : [myLocation.lat, myLocation.lng],
      zoom: 13,
    });

    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 25,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Map data ©2022 Google",
    }).addTo(initialMap);

    assets?.forEach((asset) => {
      if (asset.location && asset.location.coordinates) {
        const [lng, lat] = asset.location.coordinates; // Make sure to reverse the order for Leaflet
        const marker = L.marker([lat, lng], {
          icon: custoMicon,
        }).addTo(initialMap);

        marker.bindPopup(`
          <b>${asset.assetDescription || "Asset"}</b><br>
          Room Number: ${asset.roomNumber}<br>
          Floor Number: ${asset.floorNumber}<br>
          Capacity: ${asset.peopleCapacity}<br>
          Size: ${asset.roomSize}<br>
          Monthly Price: ${asset.leaseCondition?.monthlyPrice}
        `);
      }
    });

    return () => {
      initialMap.remove();
    };
  }, [myLocation, assets, single]);

  return (
    <Grid
      container
      direction="column"
      width="100%"
      height="100%"
      rowSpacing={4}
      wrap="nowrap"
    >
      <Grid
        item
        container
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        {!single && (
          <Grid item>
            <Btn onClick={() => setMap(false)}>List View</Btn>
          </Grid>
        )}
      </Grid>
      <Grid item width="100%" height="90%">
        <div
          id="rmap"
          style={{ height: "100%", width: "100%", overflow: "hidden" }}
        />
      </Grid>
    </Grid>
  );
};
