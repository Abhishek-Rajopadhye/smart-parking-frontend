import { useContext, useEffect, useState } from "react";
import {
	Box,
	Typography,
	Paper,
	Grid,
	Avatar,
	Button,
	Card,
	CardContent,
	CardActions,
	Divider,
	Dialog,
	Chip,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { EditSpot } from "../components/EditSpot";
import axios from "axios";
import { CurrencyRupee } from "@mui/icons-material";
import { BACKEND_URL } from "../const";
import { SpotBookingView } from "../components/SpotBookingView";
import { ConfirmationDialogBox } from "../components/ConfirmationDialogBox";
import { useNavigate } from "react-router-dom";

/**
 * OwnerDashboard component for parking spot owners to manage their profile, spots, and bookings.
 *
 * @component
 * @returns {JSX.Element} The OwnerDashboard component.
 *
 * Displays the owner's profile information, a list of their parking spots with options to edit, delete, or view bookings,
 * and allows editing the profile via a modal. Also provides dialogs for booking history, editing spots, and confirming deletions.
 */
const OwnerDashboard = () => {
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	const [selectedSpot, setSelectedSpot] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userSpots, setUserSpots] = useState([]);
	const [bookingHistoryDialogBoxOpen, setBookingHistoryDialogBoxOpen] = useState(false);
	const [bookingDetails, setBookingDetails] = useState([]);
	const [editSpotOpen, setEditSpotOpen] = useState(false);
	const [totalEarning, setTotalEarning] = useState(0);
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationMessage, setConfirmationMessage] = useState(null);
	const [selectedSpotID, setSelectedSpotID] = useState(null);

	// Fetch profile and spots
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

	const fetchUserSpots = async () => {
		const token = localStorage.getItem("token");
		const user_id = String(localStorage.getItem("user_id"));
		try {
			const response = await axios.get(`${BACKEND_URL}/spots/owner/${user_id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.status === 200) {
				console.log(response.data.openDays);
				setUserSpots(response.data);
				const total = response.data.reduce((acc, spot) => acc + (spot.totalEarning || 0), 0);
				setTotalEarning(total);
			}
		} catch (error) {
			console.error("Error fetching user spots:", error);
		}
	};

	useEffect(() => {
		fetchUserSpots();
	}, []);

	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	const handleSave = async (updatedUser) => {
		try {
			const user_id = String(localStorage.getItem("user_id"));
			const response = await axios.put(`${BACKEND_URL}/users/profile/${user_id}`, updatedUser, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (response.status !== 200) throw new Error("Failed to update profile");
			handleCloseModal();
			fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	const handleViewBookingHistory = async (spotId) => {
		try {
			const response = await axios.get(`${BACKEND_URL}/bookings/spot/${spotId}`);
			if (response.status === 200) setBookingDetails(response.data);
		} catch (error) {
			console.error("Error fetching booking history:", error);
		}
		setBookingHistoryDialogBoxOpen(true);
	};

	const handleCloseDialog = () => setBookingHistoryDialogBoxOpen(false);

	const toggleEditSpot = () => setEditSpotOpen(!editSpotOpen);

	const handleEditSpot = async (spotId, updated_spot) => {
		try {
			const response = await axios.put(`${BACKEND_URL}/spots/${spotId}`, updated_spot);
			if (response.status === 200) {
				// Optionally update the spot in userSpots
				fetchUserSpots();
			}
		} catch (error) {
			console.error("Error updating spot:", error);
		}
		toggleEditSpot();
	};

	const handleDeleteSpot = async (spotId) => {
		try {
			const response = await axios.delete(`${BACKEND_URL}/spots/${spotId}`);
			if (response.status === 200) {
				fetchUserSpots();
				setSelectedSpotID(null);
			}
		} catch (error) {
			console.error("Error deleting spot:", error);
		}
	};

	const onEditSpotClick = (spotID) => {
		setSelectedSpot(userSpots.find((spot) => spot.id === spotID));
		toggleEditSpot();
	};

	const onDeleteSpotClick = (spotId) => {
		setSelectedSpotID(spotId);
		setConfirmationMessage("Are you sure you want to delete this spot?");
		setConfirmationDialogOpen(true);
	};

	const onDeleteConfirmation = () => {
		setConfirmationDialogOpen(false);
		setConfirmationMessage(null);
		handleDeleteSpot(selectedSpotID);
	};

	return (
		<Box sx={{ flexGrow: 1, mt: 10, px: 2 }}>
			<Grid container spacing={3}>
				{/* Profile Segment */}
				<Grid item xs={12} md={4}>
					<Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Avatar src={user.profile_picture} alt={user.name} sx={{ width: 80, height: 80, mr: 2 }} />
							<Box>
								<Typography variant="h5" fontWeight="bold">
									{user.name}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{user.email}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Ph.No: {user.phone || "Not provided"}
								</Typography>
							</Box>
						</Box>
						<Divider sx={{ my: 2 }} />
						<Typography variant="subtitle1" fontWeight="bold">
							Total Earnings:
						</Typography>
						<Typography variant="h6" color="success.main" display="flex" alignItems="center">
							<CurrencyRupee fontSize="small" />
							{totalEarning}
						</Typography>
						<Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }} fullWidth>
							Edit Profile
						</Button>
					</Paper>
				</Grid>

				{/* My Spots Segment */}
				<Grid item xs={12} md={4}>
					<Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
								My Spots
							</Typography>
							<Button variant="outlined" color="success" onClick={() => navigate("/addspotowner")} sx={{ ml: 1 }}>
								Add Spot
							</Button>
						</Box>
						<Divider sx={{ mb: 2 }} />
						<Box sx={{ maxHeight: 350, overflowY: "auto" }}>
							{userSpots.length > 0 ? (
								userSpots.map((spot) => (
									<Card
										key={spot.id}
										elevation={2}
										sx={{
											mb: 2,
											borderRadius: 2,
											bgcolor: "lightgray",
										}}
									>
										<CardContent>
											<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
												<Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
													{spot.title}
												</Typography>
												{/* Spot Status Chip */}
												{spot.status === 1 && (
													<Chip label="Verified" color="success" size="small" sx={{ ml: 1 }} />
												)}
												{spot.status === 0 && (
													<Chip
														label="Pending"
														color="warning"
														size="small"
														sx={{ ml: 1, bgcolor: "#ffb300", color: "#fff" }}
													/>
												)}
												{spot.status === -1 && (
													<Chip label="Rejected" color="error" size="small" sx={{ ml: 1 }} />
												)}
											</Box>
											<Typography variant="body2" color="text.secondary">
												📍 {spot.address}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												<strong>Open Days:</strong>{" "}
												{Array.isArray(spot.openDays)
													? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
															.filter((day) => spot.openDays.includes(day))
															.join(", ")
													: typeof spot.openDays === "string"
													? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
															.filter((day) => spot.openDays.includes(day))
															.join(", ")
													: ""}
											</Typography>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
													<strong>Open Time:</strong> {spot.openTime}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													<strong>Close Time:</strong> {spot.closeTime}
												</Typography>
											</Box>

											<Box sx={{ display: "flex", alignItems: "center" }}>
												{" "}
												<Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
													<strong>Total Slots:</strong>{" "}
													{userSpots.reduce((acc, spot) => acc + (spot.total_slots || 0), 0)}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													<strong>Available Slots:</strong>{" "}
													{userSpots.reduce((acc, spot) => acc + (spot.available_slots || 0), 0)}
												</Typography>
											</Box>
											<Typography variant="body2" color="text.secondary">
												<strong>Hourly Rate: ₹</strong> {spot.hourlyRate}
											</Typography>
											<Typography variant="body2" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
												Earnings: ₹{" " + spot.totalEarning}
											</Typography>
										</CardContent>
										<CardActions sx={{ justifyContent: "space-between" }}>
											<Button variant="outlined" color="primary" onClick={() => onEditSpotClick(spot.id)}>
												Edit
											</Button>
											<Button variant="outlined" color="error" onClick={() => onDeleteSpotClick(spot.id)}>
												Delete
											</Button>
											<Button
												variant="contained"
												color="secondary"
												onClick={() => handleViewBookingHistory(spot.id)}
											>
												View Bookings
											</Button>
										</CardActions>
									</Card>
								))
							) : (
								<Typography variant="body2" align="center" color="text.secondary">
									No spots found.
								</Typography>
							)}
						</Box>
					</Paper>
				</Grid>
			</Grid>

			{/* Booking History Dialog */}
			{bookingHistoryDialogBoxOpen == true && bookingDetails.length > 0 ? (
				<Dialog open={bookingHistoryDialogBoxOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
					<SpotBookingView bookingDetails={bookingDetails} />
				</Dialog>
			) : (
				<Dialog
					open={bookingHistoryDialogBoxOpen}
					onClose={handleCloseDialog}
					maxWidth="md"
					fullWidth
					sx={{ m: 5, p: 2 }}
				>
					<Typography>No Bookings</Typography>
				</Dialog>
			)}

			{/* Edit Profile Modal */}
			<EditProfileModal open={isModalOpen} handleClose={handleCloseModal} user={user} handleSave={handleSave} />

			{/* Edit Spot Modal */}
			{selectedSpot && (
				<EditSpot
					open={editSpotOpen}
					handleClose={toggleEditSpot}
					spot={selectedSpot}
					handleSave={handleEditSpot}
					spot_id={selectedSpot.id}
				/>
			)}

			{/* Confirmation Dialog */}
			<ConfirmationDialogBox
				open={confirmationDialogOpen}
				message={confirmationMessage}
				onCancel={() => setConfirmationDialogOpen(false)}
				onConfirm={onDeleteConfirmation}
			/>
		</Box>
	);
};

export default OwnerDashboard;
