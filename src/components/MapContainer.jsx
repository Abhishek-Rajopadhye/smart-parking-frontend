/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState, useMemo } from "react";
import { Box, Alert } from "@mui/material";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { MarkerComponent } from "./MarkerComponent";
import { InfoWindowComponent } from "./InfoWindowComponent";
import { CircularProgress } from "@mui/material";
import { MapContext } from "../context/MapContext";

/**
 * MapContainer Component
 *
 * This component renders a Google Map with markers for parking spots.
 * It handles user geolocation, search results, and interaction with markers.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.selectedMarker - Currently selected marker
 * @param {Function} props.setSelectedMarker - Function to update selected marker
 * @param {Object} props.newMarker - Marker from search result
 * @param {Array} props.markers - Array of all parking spot markers
 * @param {Function} props.setMarkers - Function to update markers array
 * @param {Object} props.mapRef - Reference to the Google Map instance
 * @param {Array} props.filteredMarkers - Filtered subset of markers to display
 */
function MapContainer({ selectedMarker, setSelectedMarker, newMarker, markers, setMarkers, mapRef, filteredMarkers }) {
	// Access map loading state from context
	const { isLoaded, loadError } = useContext(MapContext);

	// Default center coordinates (Pune, India)
	const defaultCenter = useMemo(
		() => ({
			lat: 18.519584,
			lng: 73.855421,
		}),
		[]
	);

	// State for user's current position and map center
	const [currentPosition, setCurrentPosition] = useState(null);
	const [mapCenter, setMapCenter] = useState(defaultCenter);

	// Map container styles
	const mapStyles = {
		display: "flex",
		featureType: "all",
		elementType: "all",
		height: "100vh",
		width: "100%",
	};

	/**
	 * Get user's current geolocation if available
	 */

	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition((position) => {
				const { latitude, longitude } = position.coords;
				setCurrentPosition({ lat: latitude, lng: longitude });
			});
		}
	}, []);

	/**
	 * Update map center based on priorities:
	 * 1. Search result location (newMarker)
	 * 2. User's current location
	 * 3. Default center
	 */
	useEffect(() => {
		if (newMarker) {
			// Center the map to the searched location
			setMapCenter({ lat: newMarker.location.lat, lng: newMarker.location.lng });
		} else if (currentPosition) {
			// Center the map to user's current location if available
			setMapCenter(currentPosition);
		} else {
			// Otherwise use default center
			setMapCenter(defaultCenter);
		}
	}, [newMarker, currentPosition, defaultCenter]);

	/**
	 * Calculate distance between two geographic coordinates
	 *
	 * @param {Object} origin - Starting coordinates {lat, lng}
	 * @param {Object} destination - Ending coordinates {lat, lng}
	 * @returns {string|null} - Distance in kilometers (2 decimal places) or null if calculation fails
	 */
	const calculateDistance = (origin, destination) => {
		try {
			if (!window.google?.maps?.geometry) return null;

			if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
				throw new Error("Invalid coordinates provided for distance calculation");
			}

			// Create LatLng objects
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

	// Render loading state while map is initializing
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
						zoom={15}
						onLoad={(map) => (mapRef.current = map)}
						options={{
							gestureHandling: "greedy",
							zoomControl: true,
						}}
					>
						{/* Display filtered markers if available, otherwise show all markers */}
						{(filteredMarkers || markers).map((marker, index) => (
							<MarkerComponent key={index} marker={marker} setSelectedMarker={setSelectedMarker} />
						))}

						{/* Display search result marker when available */}
						{newMarker && (
							<MarkerComponent marker={newMarker} setSelectedMarker={setSelectedMarker} isSearchMarker={true} />
						)}

						{/* Display info window for selected marker */}
						{selectedMarker && (
							<InfoWindowComponent
								selectedMarker={selectedMarker}
								newMarker={newMarker}
								setSelectedMarker={setSelectedMarker}
								calculateDistance={calculateDistance}
							/>
						)}
					</GoogleMap>
				</>
			)}
		</Box>
	);
}

export { MapContainer };
