import { Marker } from "@react-google-maps/api";
import bluePin from "../assets/Images/bluePin.png";

const MarkerComponent = ({ marker, setSelectedMarker, isSearchMarker = false }) => {
	const position = isSearchMarker
		? { lat: marker.location.lat, lng: marker.location.lng }
		: { lat: marker.latitude, lng: marker.longitude };

	let iconToUse;

	if (isSearchMarker) {
		iconToUse = {
			url: undefined,
		};
	} else {
		iconToUse = {
			url: bluePin,
			scaledSize: new window.google.maps.Size(40, 40),
		};
	}
	return <Marker position={position} icon={iconToUse} onClick={() => setSelectedMarker(marker)} />;
};

export { MarkerComponent };
