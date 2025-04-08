import { Marker } from "@react-google-maps/api";
import bluePin from "../assets/Images/bluePin.png";
import car from "../assets/Images/car.png";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const MarkerComponent = ({ marker, setSelectedMarker, isSearchMarker = false }) => {
	const { user } = useContext(AuthContext);
	const position = isSearchMarker
		? { lat: marker.location.lat, lng: marker.location.lng }
		: { lat: marker.latitude, lng: marker.longitude };

	let iconToUse;

	if (isSearchMarker) {
		iconToUse = {
			url: undefined,
		};
	} else if (marker.owner_id === user?.id) {
		iconToUse = {
			url: bluePin,
			scaledSize: new window.google.maps.Size(40, 40),
		};
	} else {
		iconToUse = {
			url: car,
			scaledSize: new window.google.maps.Size(40, 40),
		};
	}
	return <Marker position={position} icon={iconToUse} onClick={() => setSelectedMarker(marker)} />;
};

export { MarkerComponent };
