import { useContext, useState, useEffect } from "react";
import { Container, Typography, Avatar, Button, Box, Card, CircularProgress } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { UserBookingView } from "../components/UserBookingView";
import axios from "axios";
import { BACKEND_URL } from "../const";

/**
 * Profile Component
 *
 * Displays the user's profile information in a modern and sleek design.
 * Includes a section for "My Spots" with a mapped list of SpotCards.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile component.
 */
const Profile = () => {
	const { user, setUser } = useContext(AuthContext);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userBookings, setUserBookings] = useState([]);
	const [loadingBookings, setLoadingBookings] = useState(false);

	/**
	 * Fetches the user's profile data from the server and updates the user state.
	 */
	const fetchProfile = async () => {
		const token = localStorage.getItem("token");
		const user_id = String(localStorage.getItem("user_id"));
		try {
			const response = await axios.get(`${BACKEND_URL}/users/profile/${user_id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = response.data;
			data.id = user_id;
			setUser(data);
		} catch (error) {
			setUser(null);
			console.error("Error fetching profile:", error);
		}
	};

	/**
	 * Fetches the user's bookings from the server.
	 */
	const fetchUserBookings = async () => {
		const token = localStorage.getItem("token");
		const user_id = String(localStorage.getItem("user_id"));
		setLoadingBookings(true);
		try {
			const response = await axios.get(`${BACKEND_URL}/bookings/user/${user_id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUserBookings(response.data || []);
		} catch (error) {
			console.error("Error fetching user bookings:", error);
			setUserBookings([]);
		} finally {
			setLoadingBookings(false);
		}
	};

	/**
	 * Opens the modal for editing the profile.
	 */
	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	/**
	 * Closes the modal for editing the profile.
	 */
	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	/**
	 * Handles saving the updated user profile.
	 */
	const handleSave = async (updatedUser) => {
		try {
			const user_id = String(localStorage.getItem("user_id"));
			const response = await axios.put(`${BACKEND_URL}/users/profile/${user_id}`, updatedUser, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (response.status !== 200) {
				throw new Error("Failed to update profile");
			}

			handleCloseModal();
			fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	/**
	 * Handles the cancellation of a booking.
	 *
	 * @param {number} bookingId - The ID of the booking to cancel.
	 */
	const handleCancelBooking = async (bookingId) => {
		const response = await axios.delete(`${BACKEND_URL}/bookings/${bookingId}`);
		if (response.status === 200) {
			const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (userDetailsResponse.status === 200) {
				setUserBookings(userDetailsResponse.data);
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
			const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (userDetailsResponse.status === 200) {
				setUserBookings(userDetailsResponse.data);
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
			const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
			if (userDetailsResponse.status === 200) {
				setUserBookings(userDetailsResponse.data);
			}
		}
	};

	useEffect(() => {
		fetchUserBookings();
	}, []);

	if (!user) return <Typography variant="h5">Loading profile...</Typography>;

	return (
		<Container maxWidth="lg" sx={{ overflowX: "scroll" }}>
			{/* Profile Section */}
			<Card
				elevation={3}
				sx={{
					display: "flex",
					flexDirection:"column",
					alignItems: "center",
					justifyContent: "space-between",
					padding: 3,
					borderRadius: 2,
					mb: 4,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Avatar src={user.profile_picture} alt={user.name} sx={{ width: 120, height: 120, mr: 3 }} />
					<Box>
						<Typography variant="h4" fontWeight="bold">
							{user.name}
						</Typography>
						<Typography variant="h6" color="text.secondary">
							{user.email}
						</Typography>
						<Typography variant="h6" color="text.secondary">
							Ph.No: {user.phone || "Not provided"}
						</Typography>
					</Box>
				</Box>
				<Box>
					<Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }}>
						Edit Profile
					</Button>
				</Box>
			</Card>

			{/* User Booking View Section */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" fontWeight="bold" sx={{ mb: 2, ml: 1 }}>
					My Bookings
				</Typography>
				<Divider sx={{ mb: 3 }} />
				{loadingBookings === true ? (
					<CircularProgress />
				) : (
					<UserBookingView
						bookingDetails={userBookings}
						cancelBooking={handleCancelBooking}
						checkIn={handleCheckIn}
						checkOut={handleCheckOut}
					/>
				)}
			</Box>

			{/* Edit Profile Modal */}
			<EditProfileModal open={isModalOpen} handleClose={handleCloseModal} user={user} handleSave={handleSave} />
		</Container>
	);
};

export { Profile };
