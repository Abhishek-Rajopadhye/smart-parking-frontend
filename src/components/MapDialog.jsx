import React, { useState, useCallback, useRef, useContext } from "react";
import { GoogleMap, Marker, Autocomplete, InfoWindow } from "@react-google-maps/api";

import {
	Alert,
	Snackbar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MapContext } from "../context/MapContext";

const containerStyle = {
	width: "100%",
	height: "500px",
	borderRadius: "10px",
	boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};

const defaultCenter = {
	lat: 18.52059,
	lng: 73.85537,
};

// eslint-disable-next-line no-unused-vars
const dialogStyle = {
	position: "absolute",
	zIndex: 9999,
};

function MapDialog({ open, onClose, onSave }) {
	const [markerPosition, setMarkerPosition] = useState(null);
	const [mapCenter, setMapCenter] = useState(defaultCenter);
	const [infoOpen, setInfoOpen] = useState(false);
	const autocompleteRef = useRef(null);
	const { isLoaded } = useContext(MapContext);
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const handleMapClick = useCallback((event) => {
		const position = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		};
		setMarkerPosition(position);
		setMapCenter(position);
		//setInfoOpen(true);
	}, []);

	const handleMarkerDragEnd = useCallback((event) => {
		const position = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		};
		setMarkerPosition(position);
		//setInfoOpen(true);
	}, []);

	const onPlaceChanged = () => {
		if (autocompleteRef.current) {
			const place = autocompleteRef.current.getPlace();
			if (place.geometry) {
				const location = {
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng(),
				};
				setMarkerPosition(location);
				setMapCenter(location);
				//setInfoOpen(true);
			}
		}
	};

	const handleSave = () => {
		if (markerPosition) {
			onSave(markerPosition, "success");
			onClose();
		}
	};

	const handleCancel = () => {
		setMarkerPosition(null);
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle>
				Select Location
				<IconButton onClick={onClose} style={{ position: "absolute", right: 8, top: 8 }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent>
				{isLoaded ? (
					<>
						<div style={{ marginBottom: 10 }}>
							<Autocomplete
								onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
								onPlaceChanged={onPlaceChanged}
							>
								<TextField placeholder="Search a location..." variant="outlined" fullWidth />
							</Autocomplete>
						</div>
						<Button
							variant="outlined"
							onClick={() => {
								if (navigator.geolocation) {
									navigator.geolocation.getCurrentPosition(
										(position) => {
											const currentLocation = {
												lat: position.coords.latitude,
												lng: position.coords.longitude,
											};
											setMarkerPosition(currentLocation);
											setMapCenter(currentLocation);
											onSave(currentLocation, "");
										},
										(error) => {
											console.error("Error getting current location:", error);
											alert("Unable to retrieve your location.");
										}
									);
								} else {
									alert("Geolocation is not supported by this browser.");
								}
							}}
							sx={{ mb: 2 }}
						>
							Use My Current Location
						</Button>
						<div style={{ marginTop: 10 }}>
							<GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={13} onClick={handleMapClick}>
								{markerPosition && (
									<Marker
										position={markerPosition}
										draggable
										onDragEnd={handleMarkerDragEnd}
										onClick={() => setInfoOpen(true)}
									>
										{infoOpen && (
											<InfoWindow position={markerPosition} onCloseClick={() => setInfoOpen(false)}>
												<div>
													<b>Lat:</b> {markerPosition.lat.toFixed(5)} <br />
													<b>Lng:</b> {markerPosition.lng.toFixed(5)}
												</div>
											</InfoWindow>
										)}
									</Marker>
								)}
							</GoogleMap>
						</div>
					</>
				) : (
					<div>Loading map...</div>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={handleCancel} color="secondary">
					Cancel
				</Button>
				<Button onClick={handleSave} color="primary" variant="contained" disabled={!markerPosition}>
					Save Location
				</Button>
			</DialogActions>
			<Snackbar
				open={openSnackbar.open}
				autoHideDuration={3000}
				onClose={() => setOpenSnackbar({ ...openSnackbar, open: false })}
			>
				<Alert severity={openSnackbar.severity} variant="filled">
					{openSnackbar.message}
				</Alert>
			</Snackbar>
		</Dialog>
	);
}

export default MapDialog;
