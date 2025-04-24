import React, { useState, useEffect } from "react";
import axios from "axios";

import { MapContainer } from "../components/MapContainer";
import MapSidebar from "../components/MapSideBar";
import { BACKEND_URL } from "../const";
import { Box, Button, Drawer, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const MapSearch = ({
	selectedMarker,
	setSelectedMarker,
	newMarker,
	setNewMarker,
	markers,
	setMarkers,
	mapRef,
	filteredMarkers,
	setFilters,
}) => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const theme = useTheme();
	const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));

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
		<Box sx={{ display: "flex", height: "100vh" }}>
			{/* Menu button on mobile/tablet */}
			{isMobileOrTablet && (
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={toggleDrawer}
					sx={{
						position: "fixed",
						top: 7,
						left: 16,
						zIndex: 1300,
						bgcolor: "white",
						color: "black",
						boxShadow: 3,
					}}
				>
					<MenuIcon />
				</IconButton>
			)}

			{/* Drawer for mobile/tablet */}
			<Drawer
				anchor="left"
				open={drawerOpen}
				onClose={toggleDrawer}
				variant="temporary"
				ModalProps={{ keepMounted: true }}
				sx={{
					display: { xs: "block", md: "none" },
					"& .MuiDrawer-paper": {
						width: {
							xs: "85vw",
							sm: "40vw",
						},
						padding: 2,
						backgroundColor: "#f5f5f5",
					},
				}}
			>
				<Box sx={{ mt: 7 }}>
					<MapSidebar
						mapRef={mapRef}
						setNewMarker={setNewMarker}
						setSelectedMarker={setSelectedMarker}
						markers={markers}
						setFilters={setFilters}
						filteredMarkers={filteredMarkers}
					/>
				</Box>
			</Drawer>

			{/* Main layout using Grid */}
			<Grid container sx={{ flexGrow: 1 }}>
				{/* Sidebar (desktop only) */}
				{!isMobileOrTablet && (
					<Grid item md={3}>
						<Box
							sx={{
								height: "100vh",
								// overflowY: 'auto',
								padding: 2,
								backgroundColor: "#f5f5f5",
							}}
						>
							<MapSidebar
								mapRef={mapRef}
								setNewMarker={setNewMarker}
								setSelectedMarker={setSelectedMarker}
								markers={markers}
								setFilters={setFilters}
								filteredMarkers={filteredMarkers}
							/>
						</Box>
					</Grid>
				)}

				{/* Map */}
				<Grid item xs={12} md={9}>
					<Box
						sx={{
							height: "100vh",
							pt: isMobileOrTablet ? 1 : 0, // account for MenuIcon button
							overflow: "hidden",
						}}
					>
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
