import { InfoWindow } from "@react-google-maps/api";
import { Box, Typography, IconButton, Tooltip, Button, Divider, Chip } from "@mui/material";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { useState } from "react";
import { Booking } from "../pages/Booking";
import InfoIcon from "@mui/icons-material/Info";
import { Link, useNavigate } from "react-router-dom";

const InfoWindowComponent = ({ selectedMarker, newMarker, setSelectedMarker, calculateDistance }) => {
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const navigate = useNavigate();
	const toggleDialogBooking = () => setDialogBookingOpen(!dialogBookingOpen);

	if (!selectedMarker) {
		console.error("InfoWindowComponent received null or undefined selectedMarker");
		return null;
	}

	const position = {
		lat: selectedMarker.latitude,
		lng: selectedMarker.longitude,
	};

	if (!position.lat || !position.lng) {
		console.error("InfoWindowComponent: Invalid marker position data", selectedMarker);
		return null;
	}

	console.log("Seleted marker ", selectedMarker);
	const isExistingMarker =
		selectedMarker && newMarker && (selectedMarker.name !== newMarker.name || selectedMarker.spot_id !== newMarker.spot_id);

	const isSearchLocation = !selectedMarker.spot_id;

	const handleClose = () => {
		setSelectedMarker(null);
	};
	const showDetails = () => {
		try {
			if (selectedMarker) {
				console.log("Before navigating  ", selectedMarker.spot_id); // Ensure selectedMarker is not null
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
					{/* Header with close button */}
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
						<IconButton size="small" onClick={showDetails} sx={{ marginRight: 1 }}>
							<InfoIcon color="primary" />
						</IconButton>
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

					{/* Address */}
					<Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5, maxWidth: 260 }}>
						<LocationOnIcon sx={{ mr: 1, color: "red", mt: 0.25 }} fontSize="small" />
						<Typography variant="body2">{selectedMarker.address || selectedMarker.name}</Typography>
					</Box>

					{!isSearchLocation && (
						<>
							{/* Pricing information */}
							<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
								<CurrencyRupeeIcon sx={{ mr: 1, color: "green" }} fontSize="small" />
								<Typography variant="body2" fontWeight="medium">
									{selectedMarker.hourly_rate} /per hour
								</Typography>
							</Box>

							{/* Available hours */}
							<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
								<AccessTimeFilledIcon sx={{ mr: 1, color: "#ff9800" }} fontSize="small" />
								<Typography variant="body2">
									{selectedMarker.open_time.slice(0,5)} to {selectedMarker.close_time.slice(0,5)}
								</Typography>
							</Box>
						</>
					)}

					{!isSearchLocation && isExistingMarker && (
						<>
							{/* Distance information */}
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
						</>
					)}

					{!isSearchLocation && (
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

			<Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking} />
		</Box>
	);
};

export { InfoWindowComponent };
