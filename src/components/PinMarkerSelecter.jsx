/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
	Box,
	Button,
	Container,
	Typography,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Button as MuiButton,
	Snackbar,
	Alert,
} from "@mui/material";
import { GoogleMap } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Marker } from "@react-google-maps/api";
import { useMap } from "../context/MapContext";
import pin from "../assets/Images/pinSelecter.png";

const PinMarkerSelecter = () => {
	const { isLoaded, loadError } = useMap();
	const [draggableMarker, setDraggableMarker] = useState({ lat: 18.519584, lng: 73.855421 });
	const [openDialog, setOpenDialog] = useState(false);
	const [markerAnimation, setMarkerAnimation] = useState(window.google.maps.Animation.BOUNCE);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "info", // "success", "error", "warning"
	});
	const [isRetrying, setIsRetrying] = useState(false);

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const navigate = useNavigate();

	const mapStyles = {
		display: "flex",
		featureType: "all",
		elementType: "all",
		width: "100%",
		height: "70vh",
		top: 50,
	};

	const defaultCenter = {
		lat: 18.519584,
		lng: 73.855421,
	};

	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setDraggableMarker({ lat: latitude, lng: longitude });
					setCurrentPosition({ lat: latitude, lng: longitude });

					setSnackbar({
						open: true,
						message: "📍 Location found successfully!",
						severity: "success",
					});
				},
				(error) => {
					let errorMessage = "Something went wrong.";
					if (error.code === error.PERMISSION_DENIED) {
						errorMessage = "❌ Location permission denied.";
					} else if (error.code === error.POSITION_UNAVAILABLE) {
						errorMessage = "⚠️ Location unavailable.";
					} else if (error.code === error.TIMEOUT) {
						errorMessage = "⏳ Location request timed out.";
					}

					setSnackbar({
						open: true,
						message: errorMessage,
						severity: "error",
					});
				}
			);
		} else {
			setSnackbar({
				open: true,
				message: "🚫 Geolocation not supported by your browser.",
				severity: "warning",
			});
		}
	}, []);

	const handleRetryLocation = () => {
		setIsRetrying(true);

		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setDraggableMarker({ lat: latitude, lng: longitude });
					setCurrentPosition({ lat: latitude, lng: longitude });

					setSnackbar({
						open: true,
						message: "📍 Location found successfully!",
						severity: "success",
					});
					setIsRetrying(false);
				},
				(error) => {
					let errorMessage = "Something went wrong.";
					if (error.code === error.PERMISSION_DENIED) {
						errorMessage = "❌ Location permission denied.";
					} else if (error.code === error.POSITION_UNAVAILABLE) {
						errorMessage = "⚠️ Location unavailable.";
					} else if (error.code === error.TIMEOUT) {
						errorMessage = "⏳ Location request timed out.";
					}

					setSnackbar({
						open: true,
						message: errorMessage,
						severity: "error",
					});
					setIsRetrying(false); // Stop loading
				}
			);
		} else {
			setSnackbar({
				open: true,
				message: "🚫 Geolocation not supported by your browser.",
				severity: "warning",
			});
			setIsRetrying(false);
		}
	};

	const onMarkerDragEnd = (event) => {
		if (!event || !event.latLng) {
			console.error("Error: event.latLng is undefined.", event);
			return;
		}

		const newLat = event.latLng.lat?.();
		const newLng = event.latLng.lng?.();

		if (newLat === undefined || newLng === undefined) {
			console.error("Error: Could not retrieve lat/lng from event.", event);
			return;
		}

		setDraggableMarker({ lat: newLat, lng: newLng });

		console.log("New Position:", newLat, newLng);
	};

	const handleConfirm = () => {
		navigate("/spot", {
			state: {
				lat: draggableMarker.lat,
				lng: draggableMarker.lng,
			},
		});
		console.log("", draggableMarker.lat, draggableMarker.lng);
	};

	const handleCancel = () => {
		setOpenDialog(false);
	};

	const handleSelection = () => {
		setOpenDialog(true);
	};

	if (loadError) {
		return <Alert severity="error">Error loading maps: {loadError.message}</Alert>;
	}

	if (!isLoaded) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
				<Box ml={2}>Loading Maps...</Box>
			</Box>
		);
	}

	const icon1 = { url: pin, scaledSize: new window.google.maps.Size(40, 40) };

	return (
		<Container sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<Box>
				<Typography variant="h6" sx={{ textAlign: "center", mt: 2, top: 50 }}>
					Drag the marker to your parking spot and click confirm
				</Typography>
			</Box>
			{isLoaded && (
				<>
					<GoogleMap mapContainerStyle={mapStyles} center={currentPosition || defaultCenter} zoom={12}>
						<Marker
							position={draggableMarker}
							draggable={true}
							onDragEnd={onMarkerDragEnd}
							animation={window.google.maps.Animation.BOUNCE}
							icon={icon1}
						/>
					</GoogleMap>
				</>
			)}
			<Box>
				<Button
					fullWidth
					variant="contained"
					color="secondary"
					sx={{ borderRadius: 2, mt: 4, fontSize: "large" }}
					onClick={handleSelection}
				>
					Confirm Location
				</Button>
			</Box>
			<Dialog open={openDialog} onClose={handleCancel}>
				<DialogTitle>Confirm Location</DialogTitle>
				<DialogContent>
					<DialogContentText>Are you sure you want to use this location?</DialogContentText>
					<Typography sx={{ mt: 2 }}>
						Latitude: {draggableMarker.lat.toFixed(6)} <br />
						Longitude: {draggableMarker.lng.toFixed(6)}
					</Typography>
				</DialogContent>
				<DialogActions>
					<MuiButton onClick={handleCancel} color="error">
						Cancel
					</MuiButton>
					<MuiButton onClick={handleConfirm} color="primary" variant="contained">
						Confirm
					</MuiButton>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
					action={
						snackbar.severity === "error" && (
							<Button
								color="inherit"
								size="small"
								onClick={handleRetryLocation}
								disabled={isRetrying}
								startIcon={isRetrying ? <CircularProgress size={16} color="inherit" /> : null}
							>
								{isRetrying ? "Retrying..." : "Retry"}
							</Button>
						)
					}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default PinMarkerSelecter;
