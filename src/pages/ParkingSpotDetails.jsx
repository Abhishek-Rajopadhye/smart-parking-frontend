import DetailsInfo from "../components/DetailInfo";
import { Container } from "@mui/material";

/**
 * ParkingSpot component for displaying details of a selected parking spot.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.selectedMarker - The selected marker data for the parking spot.
 * @param {Object} props.user - The current user data.
 * @returns {JSX.Element} The ParkingSpot component.
 */
const ParkingSpot = ({ selectedMarker, user }) => {
	return (
		<Container>
			<DetailsInfo selectedMarker={selectedMarker} user={user} />
		</Container>
	);
};

export default ParkingSpot;
