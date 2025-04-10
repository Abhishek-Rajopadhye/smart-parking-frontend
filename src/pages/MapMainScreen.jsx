/* eslint-disable no-unused-vars */
import React from "react";
import { useContext, useState } from "react";
import { Box, Alert } from "@mui/material";
import { GoogleMap } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { MapContext } from "../context/MapContext";

const defaultCenter = {
	lat: 18.519584,
	lng: 73.855421,
};

const MapMainScreen = () => {
	const { isLoaded, loadError } = useContext(MapContext);
	const [mapCenter, setMapCenter] = useState(defaultCenter);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();
	const [currentPosition, setCurrentPosition] = useState(null);
	const [isRetrying, setIsRetrying] = useState(false);

	const mapStyles = {
		display: "flex",
		featureType: "all",
		elementType: "all",
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
		<>
			<Box className="map-container">
				{!isLoaded ? (
					<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
						<CircularProgress />
						<Box ml={2}>Loading parking spots...</Box>
					</Box>
				) : error ? (
					<Alert severity="error">{error}</Alert>
				) : (
					<>
						<GoogleMap mapContainerStyle={mapStyles} center={currentPosition || mapCenter} zoom={12}>
							{/*Render existing parking spot markers */}
						</GoogleMap>
					</>
				)}
			</Box>
		</>
	);
};

export default MapMainScreen;
