import React, { useState, useEffect } from "react";
import axios from "axios";

import { MapContainer } from "../components/MapContainer";
import MapSidebar from "../components/MapSideBar";
import { BACKEND_URL } from "../const";
import { Box, Button, Drawer, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";


/**
 *  MapSearch
 *  This component renders the map view alongside a  sidebar.
 *  It handles marker fetching, responsive sidebar rendering (drawer for mobile), and integrates
 *  both MapContainer and MapSidebar components.
 */

/**
 * 
 *
 * @component
 * @param {Object} props - Props for MapSearch
 * @param {Object} props.selectedMarker - Currently selected marker on the map
 * @param {Function} props.setSelectedMarker - Setter to update selected marker
 * @param {Object} props.newMarker - Marker from search result
 * @param {Function} props.setNewMarker - Setter to update new marker
 * @param {Array} props.markers - All markers fetched from backend
 * @param {Function} props.setMarkers - Setter to update all markers
 * @param {Object} props.mapRef - Ref object for Google Map instance
 * @param {Array} props.filteredMarkers - Markers filtered by sidebar filters
 * @param {Function} props.setFilters - Setter to update filters from sidebar
 *
 * @returns {JSX.Element} The MapSearch component
 */

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

	/**
	 * Fetch all parking markers from backend on component mount
	 */
	
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

	/**
	 * Toggle drawer for mobile sidebar
	 */

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

				{/* Display map section */}
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
