/**
 * @file InfoWindowComponent.jsx
 * @description A component that displays information about a selected map marker in a Google Maps InfoWindow.
 *
 *
 */

import { useState } from "react";
import { InfoWindow } from "@react-google-maps/api";
import { Box, Typography, IconButton, Button, Divider, Chip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import InfoIcon from "@mui/icons-material/Info";
import { Booking } from "../pages/Booking";

/**
 * @typedef {Object} Marker
 * @property {string} [spot_id] - Unique identifier for the parking spot
 * @property {string} [spot_title] - Title of the parking spot
 * @property {string} [name] - Name of the location (used for search locations)
 * @property {string} [address] - Address of the parking spot
 * @property {number} [hourly_rate] - Hourly rate for parking
 * @property {string} [open_time] - Opening time of the parking spot
 * @property {string} [close_time] - Closing time of the parking spot
 * @property {string} [owner_id] - ID of the parking spot owner
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {Object} [location] - Location object containing lat/lng for search markers
 */

/**
 * @typedef {Object} InfoWindowComponentProps
 * @property {Marker} selectedMarker - The currently selected marker
 * @property {Marker} newMarker - The marker representing the search location
 * @property {Function} setSelectedMarker - Function to update the selected marker
 * @property {Function} calculateDistance - Function to calculate distance between two points
 */

/**
 * Displays information about a selected marker in a Google Maps InfoWindow
 *
 * @param {InfoWindowComponentProps} props - Component properties
 * @returns {JSX.Element|null} The rendered InfoWindow component or null if invalid marker
 */
const InfoWindowComponent = ({ selectedMarker, newMarker, setSelectedMarker, calculateDistance }) => {
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const navigate = useNavigate();

	/**
	 * Toggles the booking dialog open/closed state
	 */
	const toggleDialogBooking = () => setDialogBookingOpen(!dialogBookingOpen);

	// Return null if no marker is selected or if marker data is invalid
	if (!selectedMarker) {
		console.error("InfoWindowComponent received null or undefined selectedMarker");
		return null;
	}

	// Extract position from marker data
	const position = {
		lat: selectedMarker.latitude,
		lng: selectedMarker.longitude,
	};

	// Validate position data
	if (!position.lat || !position.lng) {
		console.error("InfoWindowComponent: Invalid marker position data", selectedMarker);
		return null;
	}

	// Determine marker type
	const isExistingMarker =
		selectedMarker && newMarker && (selectedMarker.name !== newMarker.name || selectedMarker.spot_id !== newMarker.spot_id);
	const isSearchLocation = !selectedMarker.spot_id;

	/**
	 * Closes the InfoWindow by setting selectedMarker to null
	 */
	const handleClose = () => {
		setSelectedMarker(null);
	};

	/**
	 * Navigates to the detailed view of the parking spot
	 */
	const showDetails = () => {
		try {
			if (selectedMarker && selectedMarker.spot_id) {
				navigate(`/spotdetail/${selectedMarker.spot_id}`);
			} else {
				throw new Error("No marker selected to navigate!");
			}
		} catch (error) {
			console.error("Navigation error:", error.message);
		}
	};

	return (
		<Box>
			<InfoWindow options={{ maxWidth: 320, headerDisabled: true }} position={position}>
				<Box
					sx={{
						bgcolor: "#ffffff",
						color: "#333",
						padding: 2,
						maxWidth: 320,
						borderRadius: 1,
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
					}}
				>
					{/* Header with title and action buttons */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 1,
						}}
					>
						<Typography variant="h6" fontWeight="bold" color="primary">
							{selectedMarker?.spot_title || "Destination"}
						</Typography>

						{/* Info button - only show for parking spots */}
						{!isSearchLocation && (
							<IconButton size="small" onClick={showDetails} sx={{ marginRight: 1 }}>
								<InfoIcon color="primary" />
							</IconButton>
						)}

						{/* Close button */}
						<IconButton
							size="small"
							onClick={handleClose}
							sx={{
								p: 0.5,
								"&:hover": {
									bgcolor: "rgba(0,0,0,0.04)",
								},
							}}
							aria-label="close"
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>

					{/* Location type indicator */}
					{isSearchLocation ? (
						<Chip label="Search Location" size="small" color="primary" variant="outlined" sx={{ mb: 1.5 }} />
					) : (
						<Chip
							icon={<LocalParkingIcon fontSize="small" />}
							label="Parking Spot"
							size="small"
							color="success"
							variant="outlined"
							sx={{ mb: 1.5 }}
						/>
					)}

					<Divider sx={{ mb: 1.5 }} />

					{/* Address information */}
					<Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5, maxWidth: 260 }}>
						<LocationOnIcon sx={{ mr: 1, color: "red", mt: 0.25 }} fontSize="small" />
						<Typography variant="body2">{selectedMarker.address || selectedMarker.name}</Typography>
					</Box>

					{/* Show additional details only for parking spots */}
					{!isSearchLocation && (
						<>
							{/* Pricing information */}
							<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
								<CurrencyRupeeIcon sx={{ mr: 1, color: "green" }} fontSize="small" />
								<Typography variant="body2" fontWeight="medium">
									{selectedMarker.hourly_rate} /per hour
								</Typography>
							</Box>

							{/* Operating hours */}
							<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
								<AccessTimeFilledIcon sx={{ mr: 1, color: "#ff9800" }} fontSize="small" />
								<Typography variant="body2">
									{selectedMarker.open_time.slice(0, 5)} to {selectedMarker.close_time.slice(0, 5)}
								</Typography>
							</Box>
						</>
					)}

					{/* Distance information (shown only when comparing search location to a parking spot) */}
					{!isSearchLocation && isExistingMarker && (
						<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
							<DirectionsWalkIcon sx={{ mr: 1, color: "#007bff" }} fontSize="small" />
							<Typography variant="body2" fontWeight="medium">
								{calculateDistance(newMarker.location || newMarker, {
									lat: position.lat,
									lng: position.lng,
								})}{" "}
								km
							</Typography>
						</Box>
					)}

					{/* Booking button - show only for parkings spots that aren't owned by the test user */}
					{!isSearchLocation && selectedMarker.owner_id !== "google-oauth2|1234567890" && (
						<Button
							variant="contained"
							color="success"
							fullWidth
							size="small"
							onClick={toggleDialogBooking}
							sx={{
								mt: 1,
								borderRadius: 2,
								textTransform: "none",
								fontWeight: "bold",
								boxShadow: 2,
							}}
							startIcon={<CurrencyRupeeIcon />}
						>
							Book Now
						</Button>
					)}
				</Box>
			</InfoWindow>

			{/* Booking dialog */}
			<Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking} />
		</Box>
	);
};

export { InfoWindowComponent };
