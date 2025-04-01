import { Marker } from "@react-google-maps/api";
import parkingIcon from "../assets/Images/car.png";

const MarkerComponent = ({ marker, setSelectedMarker, isSearchMarker = false }) => {
	const position = isSearchMarker
		? { lat: marker.location.lat, lng: marker.location.lng }
		: { lat: marker.latitude, lng: marker.longitude };

	return (
		<Marker
			position={position}
			icon={
				isSearchMarker
					? undefined
					: {
							url: parkingIcon,
							scaledSize: new window.google.maps.Size(40, 40),
					  }
			}
			onClick={() => setSelectedMarker(marker)}
		/>
	);
};

export { MarkerComponent };
