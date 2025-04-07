import { useContext, useState } from "react";
import { Container, Typography, Avatar, Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import axios from "axios";
import { CurrencyRupee } from "@mui/icons-material";
import { BACKEND_URL } from "../const";

/**
 * Profile Component
 *
 * This component displays the user's profile information, including their name, email,
 * total earnings, phone number, and profile picture. It also provides functionality
 * to edit the user's profile through a modal dialog.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile component.
 */
const Profile = () => {
	const { user, setUser } = useContext(AuthContext);
	const [isModalOpen, setIsModalOpen] = useState(false);

	/**
	 * Fetches the user's profile data from the server and updates the user state.
	 * Retrieves the authentication token and user ID from localStorage to make an
	 * authorized request to the backend API.
	 *
	 * @async
	 * @function fetchProfile
	 * @returns {Promise<void>} Resolves when the user's profile data is successfully fetched
	 *                          and the user state is updated. If an error occurs, the user
	 *                          state is set to null and the error is logged to the console.
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
	 * Opens the modal by setting the state variable `isModalOpen` to `true`.
	 * This function is typically used to trigger the display of a modal dialog.
	 * @function handleOpenModal
	 */
	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	/**
	 * Closes the modal by setting the `isModalOpen` state to `false`.
	 *
	 * @function handleCloseModal
	 */
	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	/**
	 * Handles saving the updated user profile by sending a PUT request to the server.
	 *
	 * This function retrieves the user ID and token from localStorage, then sends
	 * a PUT request to update the user's profile on the server. If the update is
	 * successful, it closes the modal and fetches the updated profile. If an error
	 * occurs during the process, it logs the error to the console.
	 *
	 * @async
	 * @function handleSave
	 * @param {Object} updatedUser - The updated user data to be saved.
	 * @throws {Error} Throws an error if the profile update fails.
	 *
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

			// Update user context or state here if needed
			handleCloseModal();
			fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	if (!user) return <Typography variant="h5">Loading profile...</Typography>;

	return (
		<Container className="profile" sx={{ position:"relative", textAlign: "center", mb:50}}>
			<Avatar src={user.profile_picture} alt={user.name} sx={{ width: 100, height: 100, margin: "auto" }} />
			<Typography variant="h4">{user.name}</Typography>
			<Typography variant="h6">{user.email}</Typography>
			<Typography variant="h6">
				Total Earnings: <CurrencyRupee fontSize="small" />
				{user.total_earnings}
			</Typography>
			<Typography variant="h6">Ph.No: {user.phone || "Not provided"}</Typography>
			<Button variant="contained" color="primary" onClick={handleOpenModal} style={{ marginTop: "20px" }}>
				Edit Profile
			</Button>
			<EditProfileModal open={isModalOpen} handleClose={handleCloseModal} user={user} handleSave={handleSave} />
		</Container>
	);
};

export { Profile };
