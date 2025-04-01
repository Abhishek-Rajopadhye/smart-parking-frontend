import { DetailsInfo } from "../components/DetailInfo";
import { Container } from "@mui/material";

const ParkingSpot = ({ selectedMarker, user }) => {
	return (
		<Container>
			<DetailsInfo selectedMarker={selectedMarker} user={user} />
		</Container>
	);
};

export default ParkingSpot;
