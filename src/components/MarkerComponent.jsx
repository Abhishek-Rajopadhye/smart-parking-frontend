import { Marker } from "@react-google-maps/api";
import bluePin from "../assets/Images/bluePin.png";

/**
 * MarkerComponent renders a Google Maps marker with custom icon and click behavior.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.marker - The marker data object.
 * @param {Function} props.setSelectedMarker - Function to set the selected marker when clicked.
 * @param {boolean} [props.isSearchMarker=false] - If true, uses search marker coordinates and default icon.
 * @returns {JSX.Element} The MarkerComponent.
 */
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
