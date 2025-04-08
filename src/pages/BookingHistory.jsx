import { useContext, useEffect, useState } from "react";
import { Container, Tab, AppBar } from "@mui/material";
import { UserBookingView } from "../components/UserBookingView";
import { OwnerBookingView } from "../components/OwnerBookingView";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BACKEND_URL } from "../const";
import "../style/booking_history.css";

/**
 * BookingHistory page component for displaying user and owner booking history.
 *
 * Fetches and displays booking details for the logged-in user, including both
 * user bookings and owner bookings. Allows users to cancel bookings.
 *
 * @component
 * @returns {JSX.Element} The BookingHistory page component.
 */
const BookingHistory = () => {
	const [tabIndex, setTabIndex] = useState("0");
	const { user } = useContext(AuthContext);
	const [userBookings, setUserBookings] = useState([]);
	const [ownerBookings, setOwnerBookings] = useState([]);

	/**
	 * Fetches booking details for the logged-in user and owner.
	 */
	useEffect(() => {
		const fetchDetailsUserBookings = async () => {
			const response = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (response.status == 200) {
				setUserBookings(response.data);
			}
		};

		const fetchDetailsOwnerBookings = async () => {
			const response = await axios.get(`${BACKEND_URL}/bookings/owner/${user.id}`);
			if (response.status == 200) {
				setOwnerBookings(response.data);
			}
		};

		fetchDetailsUserBookings();
		fetchDetailsOwnerBookings();
	}, [user.id]);

	/**
	 * Handles the cancellation of a booking.
	 *
	 * @param {number} bookingId - The ID of the booking to cancel.
	 * @param {string} tab - The tab from which the cancellation is triggered ("user" or "owner").
	 */
	const handleCancelBooking = async (bookingId) => {
		const response = await axios.delete(`${BACKEND_URL}/bookings/${bookingId}`);
		if (response.status == 200) {
			const owner_details_response = await axios.get(`${BACKEND_URL}/bookings/owner/${user.id}`);
			if (owner_details_response.status == 200) {
				setOwnerBookings(owner_details_response.data);
			}
			const user_details_response = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (user_details_response.status == 200) {
				setUserBookings(user_details_response.data);
			}
		}
	};

	/**
	 * Handles the check-in of a booking.
	 *
	 * @param {number} bookingId - The ID of the booking to check in.
	 */
	const handleCheckIn = async (bookingId) => {
		const response = await axios.put(`${BACKEND_URL}/bookings/checkin/${bookingId}`);
		if (response.status === 200) {
			// Refresh user bookings
			const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (userDetailsResponse.status === 200) {
				setUserBookings(userDetailsResponse.data);
			}

			// Refresh owner bookings
			const ownerDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/owner/${user.id}`);
			if (ownerDetailsResponse.status === 200) {
				setOwnerBookings(ownerDetailsResponse.data);
			}
		}
	};

	/**
	 * Handles the check-out of a booking.
	 *
	 * @param {number} bookingId - The ID of the booking to check out.
	 */
	const handleCheckOut = async (bookingId) => {
		const response = await axios.put(`${BACKEND_URL}/bookings/checkout/${bookingId}`);
		if (response.status === 200) {
			// Refresh user bookings
			const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (userDetailsResponse.status === 200) {
				setUserBookings(userDetailsResponse.data);
			}

			// Refresh owner bookings
			const ownerDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/owner/${user.id}`);
			if (ownerDetailsResponse.status === 200) {
				setOwnerBookings(ownerDetailsResponse.data);
			}
		}
	};

	return (
		<Container sx={{ position: "relative", width: "100vw", alignContent: "center" }}>
			<TabContext value={tabIndex}>
				<AppBar sx={{ position: "relative", borderRadius: 2, zIndex: 2, backgroundColor: "black" }}>
					<TabList
						slotProps={{
							indicator: {
								style: {
									backgroundColor: "white",
								},
							},
						}}
						onChange={(e, newIndex) => setTabIndex(newIndex)}
						variant="fullWidth"
						centered
						sx={{ borderRadius: 2, "&.Mui-selected": { color: "#1976d2" } }}
					>
						<Tab label="User Bookings" value="0" sx={{ color: "#1976d2", "&.Mui-selected": { color: "white" } }} />
						<Tab label="Owner Bookings" value="1" sx={{ color: "#1976d2", "&.Mui-selected": { color: "white" } }} />
					</TabList>
				</AppBar>
				<TabPanel value="0" sx={{ height: "100vh" }}>
					<UserBookingView
						bookingDetails={userBookings}
						cancelBooking={handleCancelBooking}
						checkIn={handleCheckIn}
						checkOut={handleCheckOut}
					/>
				</TabPanel>
				<TabPanel value="1" sx={{ height: "100vh" }}>
					<OwnerBookingView bookingDetails={ownerBookings} />
				</TabPanel>
			</TabContext>
		</Container>
	);
};

export { BookingHistory };
