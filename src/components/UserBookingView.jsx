import { useEffect, useState, useContext } from "react";
import { Container, Typography, List, ListItem, ListItemText, Box, Button, Divider, Icon } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CurrencyRupee } from "@mui/icons-material";

const UserBookingView = () => {
	const [bookings, setBookings] = useState([]);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		const fetchDetails = async () => {
			const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/bookings/user/${user.id}`);
			if (response.status == 200) {
				setBookings(response.data);
			}
		};

		fetchDetails();
	}, [user.id]);

	const handleEdit = (bookingId) => {
		console.log("Edit booking", bookingId);
		// Implement edit functionality
	};

	const handleCancel = (bookingId) => {
		console.log("Cancel booking", bookingId);
		// Implement cancel functionality
	};

	return (
		<Container>
			<Typography variant="h5" gutterBottom>
				User Booking History
			</Typography>
			<List>
				{bookings != [] ? (
					bookings.map((booking) => (
						<ListItem
							key={booking.id}
							secondaryAction={
								<Box>
									<Button
										onClick={() => handleEdit(booking.id)}
										variant="contained"
										color="primary"
										size="small"
										sx={{ mr: 1 }}
									>
										Edit
									</Button>
									<Button
										onClick={() => handleCancel(booking.id)}
										variant="contained"
										color="secondary"
										size="small"
									>
										Cancel
									</Button>
								</Box>
							}
						>
							<ListItemText
								secondary={`From: ${booking.start_date_time} - ${booking.end_date_time}`}
								slotProps={{ secondary: { color: "info" } }}
							>
								<Typography>{booking.spot_title}</Typography>
							</ListItemText>
							<ListItemText>
								<CurrencyRupee fontSize="small"></CurrencyRupee> {booking.payment_amount}
							</ListItemText>
							<ListItemText>{booking.payment_status}</ListItemText>
							<Divider />
						</ListItem>
					))
				) : (
					<Typography>No bookings found.</Typography>
				)}
			</List>
		</Container>
	);
};

export { UserBookingView };
