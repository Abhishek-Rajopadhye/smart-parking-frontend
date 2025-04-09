import { useContext, useEffect, useState } from "react";
import { Container, Typography, Avatar, Button, Box, Card, CardActions, Divider, List, ListItem, ListItemText, Dialog } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import axios from "axios";
import { CurrencyRupee } from "@mui/icons-material";
import { BACKEND_URL } from "../const";
import { OwnerBookingView } from "../components/OwnerBookingView";

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
    const [userSpots, setUserSpots] = useState([]); // State to store user's spots
	const [dialogBoxOpen, setDialogBoxOpen] = useState(false);
	const [bookingDetails, setBookingDetails] = useState(null);

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


    useEffect(() => {
		// Fetch user's spots
		const fetchUserSpots = async () => {
			const token = localStorage.getItem("token");
			const user_id = String(localStorage.getItem("user_id"));
			try {
				const response = await axios.get(`${BACKEND_URL}/spots/owner/${user_id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.status === 200) {
					setUserSpots(response.data);
				}
			} catch (error) {
				console.error("Error fetching user spots:", error);
			}
		};
    	fetchUserSpots();
    }, []);

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

    // Open the dialog with the OwnerBookingView component
    const handleViewBookingHistory = async (spotId) => {
		try{
			const response = await axios.get(`${BACKEND_URL}/bookings/spot/${spotId}`);
			if (response.status === 200) {
				setBookingDetails(response.data);
			}
		}
		catch (error) {
			console.error("Error fetching booking history:", error);
		}
		setDialogBoxOpen(true);
    };

    // Close the dialog
    const handleCloseDialog = () => {
        setDialogBoxOpen(false);
    };


    // Placeholder for editing a spot
    const handleEditSpot = (spotId) => {
        console.log(`Edit spot with ID: ${spotId}`);
    };

    // Placeholder for deleting a spot
    const handleDeleteSpot = (spotId) => {
        console.log(`Delete spot with ID: ${spotId}`);
    };

	if (!user) return <Typography variant="h5">Loading profile...</Typography>;

	return (
		<Container maxWidth="lg" sx={{mt:10}}>
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
            <Box sx={{ overflowY: "scroll", borderRadius: 2, p: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    My Spots
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <List>
                    {userSpots.length > 0 ? (
                        userSpots.map((spot) => (
                            <ListItem key={spot.spot_id} sx={{ mb: 2 }}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        padding: 2,
                                        borderRadius: 2,
                                    }}
                                >
                                    <ListItemText
                                        primary={spot.title}
                                        secondary={`Location: ${spot.address}`}
                                        sx={{ mb: 1 }}
                                    />
                                    <CardActions sx={{ justifyContent: "flex-end" }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleEditSpot(spot.spot_id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteSpot(spot.spot_id)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleViewBookingHistory(spot.spot_id)}
                                        >
                                            View Booking History
                                        </Button>
                                    </CardActions>
                                </Card>
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body1" align="center" color="text.secondary">
                            No spots found.
                        </Typography>
                    )}
                </List>
				{ /* Booking History Dialog */ }
				<Dialog open={dialogBoxOpen} onClose={handleCloseDialog}>
					<OwnerBookingView bookingDetails={bookingDetails}/>
				</Dialog>
            </Box>

			{/* Edit Profile Modal */}
			<EditProfileModal open={isModalOpen} handleClose={handleCloseModal} user={user} handleSave={handleSave} />
		</Container>
	);
};

export { Profile };
