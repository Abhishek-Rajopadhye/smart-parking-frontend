import React, { useContext, useMemo } from "react";
import { MapContext } from "../context/MapContext";
import { Alert, Box, CircularProgress } from "@mui/material";
import { GoogleMap, Marker } from "@react-google-maps/api";

const MapComponentOwner = ({ spots }) => {
	const { isLoaded, loadError } = useContext(MapContext);

	const defaultCenter = useMemo(() => {
		if (spots && spots.length > 0) {
			return {
				lat: spots[0].latitude,
				lng: spots[0].longitude,
			};
		}
		return { lat: 18.5204, lng: 73.8567 }; // Pune center fallback
	}, [spots]);

	const mapContainerStyle = {
		width: "100%",
		height: "400px", // or 100vh if you want full screen
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
		<Box>
			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				center={defaultCenter}
				zoom={14}
				options={{
					disableDefaultUI: false,
					streetViewControl: false,
					fullscreenControl: false,
				}}
			>
				{spots.map((spot, index) => (
					<Marker key={spot.spot_id || index} position={{ lat: spot.latitude, lng: spot.longitude }} />
				))}
			</GoogleMap>
		</Box>
	);
};

export default MapComponentOwner;
