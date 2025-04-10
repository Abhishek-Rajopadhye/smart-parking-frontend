import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Box } from "@mui/material";
import { MapContainer } from "../components/MapContainer";
import MapSidebar from "../components/MapSideBAr";
import { FilterPanel } from "../components/FilterPanel";
import { BACKEND_URL } from "../const";




const MapSearch = ({ selectedMarker, setSelectedMarker, newMarker, setNewMarker, markers, setMarkers, mapRef, filteredMarkers }) => {
    

  useEffect(() => {
		const fetchMarkers = async () => {
			try {
				const response = await axios.get(`${BACKEND_URL}/spotdetails/getparkingspot`);
				if (!response.data) {
					throw new Error("No data received from the server");
				}

				setMarkers(response.data);
			;
			} catch (error) {
				console.error("Error fetching markers", error);
				
			} 
		};

		fetchMarkers();
	}, [setMarkers]);

  console.log('Fetch in the MapSearch',markers);


    return (
      <Box  display="flex">
        
    <MapSidebar mapRef={mapRef}
    setNewMarker={setNewMarker}
    setSelectedMarker={setSelectedMarker}
    markers={markers}
    />
    
        {/* Right-side map content goes here */}
        <Box flex={1} >
          {/* Your MapContainer or MapView goes here */}
          <MapContainer
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          newMarker={newMarker}
          setNewMarker={setNewMarker}
          markers={markers}
          setMarkers={setMarkers}
          mapRef={mapRef}
          filteredMarkers={filteredMarkers}
          
          />
        </Box>
      </Box>
    );
  };

export default MapSearch;