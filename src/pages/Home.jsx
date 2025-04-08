// Home.jsx
import { Container } from "@mui/material";
import { MapContainer as Map } from "../components/MapContainer";

/**
 * Home component renders the main container for the application, including the Map component.
 * @component
 * @param {Object} props - The props object.
 * @param {Object} props.selectedMarker - The currently selected marker on the map.
 * @param {Function} props.setSelectedMarker - Function to update the selected marker.
 * @param {Object} props.newMarker - The new marker being added to the map.
 * @param {Function} props.setNewMarker - Function to update the new marker state.
 * @param {Array} props.markers - Array of all markers displayed on the map.
 * @param {Function} props.setMarkers - Function to update the markers array.
 * @param {Object} props.mapRef - Reference to the map instance.
 *
 * @returns {JSX.Element} The rendered Home component.
 */
function Home({ selectedMarker, setSelectedMarker, newMarker, setNewMarker, markers, setMarkers, mapRef, filteredMarkers }) {
	return (
		<Container>
			<Map
				selectedMarker={selectedMarker}
				setSelectedMarker={setSelectedMarker}
				newMarker={newMarker}
				setNewMarker={setNewMarker}
				markers={markers}
				setMarkers={setMarkers}
				mapRef={mapRef}
				filteredMarkers={filteredMarkers}
			/>
		</Container>
	);
}

export { Home };
