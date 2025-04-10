import React, { useState, useEffect } from "react";
import axios from "axios";

import { MapContainer } from "../components/MapContainer";
import MapSidebar from "../components/MapSideBar";
import { BACKEND_URL } from "../const";
import { Drawer, Box, Button, Grid, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


const MapSearch = ({ selectedMarker, setSelectedMarker, newMarker, setNewMarker, markers, setMarkers, mapRef, filteredMarkers }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  useEffect(() => {
		const fetchMarkers = async () => {
			try {
				const response = await axios.get(`${BACKEND_URL}/spotdetails/getparkingspot`);
				if (!response.data) {
					throw new Error("No data received from the server");
				}

				setMarkers(response.data);
			} catch (error) {
				console.error("Error fetching markers", error);
			}
		};

		fetchMarkers();
	}, [setMarkers]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' ,alignItems:"flex-start"}}>
      {/* Mobile Drawer Button */}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer}
        sx={{ display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Left Sidebar as Drawer on mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { sm: 'none',md:"none" }, // Hide on larger screens
           width: '250px',  // Fixed width for mobile view
        }}
      >
        <Box
          sx={{
            width: 250,
            padding: 2,
            backgroundColor: '#f5f5f5',
            overflowY: 'hidden',
          }}
        >
          {/* Your Sidebar Content Here */}
          <MapSidebar mapRef={mapRef}
    setNewMarker={setNewMarker}
    setSelectedMarker={setSelectedMarker}
    markers={markers}
    />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Left Sidebar (Visible on larger screens) */}
        <Grid item xs={12} sm={4} md={3}>
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#f5f5f5',
              display: { xs: 'none', sm: "block" }, // Hide on mobile
              height: '100vh',
              
              
           
            }}
          >
            {/* Your Left Sidebar Content Here */}
            <MapSidebar mapRef={mapRef}
    setNewMarker={setNewMarker}
    setSelectedMarker={setSelectedMarker}
    markers={markers}
    />
          </Box>
        </Grid>

        {/* Right Map Container */}
        <Grid item xs={12} sm={8} md={9}>
          <Box
            sx={{
              padding: 2,
              height: '100vh',
              overflow: 'auto',
              overflowX:"hidden",
            }}
          >
            {/* Your Map Container Content Here */}
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
        </Grid>
      </Grid>
    </Box>
  );
};


export default MapSearch;
