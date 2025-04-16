/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { Box, Button, Alert, Snackbar, Dialog } from "@mui/material";
import { GoogleMap } from "@react-google-maps/api";
import { MarkerComponent } from "./MarkerComponent";
import { InfoWindowComponent } from "./InfoWindowComponent";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { MapContext } from "../context/MapContext";
import { Spot } from "../pages/Spot";

function MapContainer({ selectedMarker, setSelectedMarker, newMarker, markers, setMarkers, mapRef, filteredMarkers }) {
	const { isLoaded, loadError } = useContext(MapContext);
	const navigate = useNavigate();
	const defaultCenter = {
		lat: 18.519584,
		lng: 73.855421,
	};

	const [currentPosition, setCurrentPosition] = useState(null);
	const [openAddSpotDialogBox, setOpenAddSpotDialogBox] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "info", // "success", "error", "warning"
	});
	const [isRetrying, setIsRetrying] = useState(false);
	const [mapCenter, setMapCenter] = useState(defaultCenter);

	const mapStyles = {
		display: "flex",
		featureType: "all",
		elementType: "all",
		height: "100vh",
		width: "100%",
	};

	
	/**
	 * Fetch parking spot markers from the API
	 */

	//console.log("Marker fetched ", markers);
	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
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

	

	useEffect(() => {
		if (newMarker) {
			// Center the map to the searched location
			setMapCenter({ lat: newMarker.lat, lng: newMarker.lng });
		} else if (currentPosition) {
			// Center the map to user's current location if available
			setMapCenter(currentPosition);
		} else {
			// Otherwise use default center
			setMapCenter(defaultCenter);
		}
	}, [newMarker, currentPosition]);

	// Calculate distance between selected marker and the seach point location
	const calculateDistance = (origin, destination) => {
		try {
			if (!window.google?.maps?.geometry) return null;

			if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
				throw new Error("Invalid coordinates provided for distance calculation");
			}

			const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);

			const destinationLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

			// Distance in meters
			const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
				originLatLng,
				destinationLatLng
			);

			// Converting  km with 2 decimal places
			return (distanceInMeters / 1000).toFixed(2);
		} catch (error) {
			console.error("Distance claculation error:", error);
			return null;
		}
	};

	console.log("center ",currentPosition ,defaultCenter)

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
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

	return (
		<Box className="map-container">
			{!isLoaded ? (
				<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
					<CircularProgress />
					<Box ml={2}>Loading parking spots...</Box>
				</Box>
			) : (
				<>
					<GoogleMap
						mapContainerStyle={mapStyles}
						center={mapCenter}
						zoom={12}
						onLoad={(map) => (mapRef.current = map)}
						options={{
							gestureHandling: 'greedy', // <-- important
							zoomControl: true,
						  }}
					>
						{/*Render existing parking spot markers */}

						{filteredMarkers
							? filteredMarkers.map((marker, index) => (
									<MarkerComponent key={index} marker={marker} setSelectedMarker={setSelectedMarker} />
							  ))
							: markers.map((marker, index) => (
									<MarkerComponent key={index} marker={marker} setSelectedMarker={setSelectedMarker} />
							  ))}

						{/* Render search result marker when searched  */}
						{newMarker && (
							<MarkerComponent marker={newMarker} setSelectedMarker={setSelectedMarker} isSearchMarker={true} />
						)}

						{selectedMarker && (
							<InfoWindowComponent
								selectedMarker={selectedMarker}
								newMarker={newMarker}
								setSelectedMarker={setSelectedMarker}
								calculateDistance={calculateDistance}
							/>
						)}
					</GoogleMap>

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
				</>
			)}
		</Box>
	);
}

export { MapContainer };
