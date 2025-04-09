import { useContext, useState } from "react";
import { Container, Typography, Avatar, Button, Box, Card, Divider, List, ListItem, ListItemText } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import axios from "axios";
import { CurrencyRupee } from "@mui/icons-material";
import { BACKEND_URL } from "../const";

/**
 * Profile Component
 *
 * Displays the user's profile information in a modern and sleek design.
 * Includes a placeholder section for "My Spots" with a mapped list of SpotCards.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile component.
 */
const Profile = () => {
	const { user, setUser } = useContext(AuthContext);
	const [isModalOpen, setIsModalOpen] = useState(false);

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

	if (!user) return <Typography variant="h5">Loading profile...</Typography>;

	return (
		<Container maxWidth="lg" >
			{/* Profile Section */}
			<Card
				elevation={3}
				sx={{
					display: "flex",
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
					<Typography variant="h6" fontWeight="bold">
						Total Earnings:
					</Typography>
					<Typography variant="h5" color="primary" display="flex" alignItems="center">
						<CurrencyRupee fontSize="small" />
						{user.total_earnings}
					</Typography>
					<Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }}>
						Edit Profile
					</Button>
				</Box>
			</Card>

			{/* My Spots Section */}
			<Box sx={{ overflowY: "scroll", backgroundColor: "#313131", borderRadius: 2, p: 4 }}>
				<Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
					My Spots
				</Typography>
				<Divider sx={{ mb: 3 }} />
				<List>
					{/* Placeholder for SpotCards */}
					{[1, 2, 3].map((spot, index) => (
						<ListItem key={index} sx={{ mb: 2 }}>
							<Card
								elevation={2}
								sx={{
									width: "100%",
									display: "flex",
									alignItems: "center",
									padding: 2,
									borderRadius: 2,
								}}
							>
								<ListItemText
									primary={`SpotCard Placeholder ${index + 1}`}
									secondary="This is a placeholder for a parking spot."
								/>
							</Card>
						</ListItem>
					))}
				</List>
			</Box>

			{/* Edit Profile Modal */}
			<EditProfileModal open={isModalOpen} handleClose={handleCloseModal} user={user} handleSave={handleSave} />
		</Container>
	);
};

export { Profile };
