import { useContext, useEffect, useState } from "react";
import {
    Container,
    Typography,
    Avatar,
    Button,
    Box,
    Card,
    CardActions,
    Divider,
    List,
    ListItem,
    Dialog,
    CardContent,
    Grid,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { EditSpot } from "../components/EditSpot";
import axios from "axios";
import { CurrencyRupee } from "@mui/icons-material";
import { BACKEND_URL } from "../const";
import { SpotBookingView } from "../components/SpotBookingView";
import { ConfirmationDialogBox } from "../components/ConfirmationDialogBox";

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
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userSpots, setUserSpots] = useState([]); // State to store user's spots
    const [bookingHistoryDialogBoxOpen, setBookingHistoryDialogBoxOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState([]);
    const [editSpotOpen, setEditSpotOpen] = useState(false);
    const [totalEarning, setTotalEarning] = useState(0); // State to store total earnings
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState(null);
    const [selectedSpotID, setSelectedSpotID] = useState(null);

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
                    console.log(response.data)
                    const total = response.data.reduce((acc, spot) => acc + spot.totalEarning, 0);
                    setTotalEarning(total);
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
        try {
            const response = await axios.get(`${BACKEND_URL}/bookings/spot/${spotId}`);
            if (response.status === 200) {
                setBookingDetails(response.data);
            }
        } catch (error) {
            console.error("Error fetching booking history:", error);
        }
        setBookingHistoryDialogBoxOpen(true);
    };

    // Close the dialog
    const handleCloseDialog = () => {
        setBookingHistoryDialogBoxOpen(false);
    };

    const handleEditSpot = async (spotId, updated_spot) => {
        try {
            const response = await axios.put(`${BACKEND_URL}/spots/${spotId}`, updated_spot);
            if (response.status === 200) {
                setBookingDetails(response.data);
            }
        } catch (error) {
            console.error("Error updating spot:", error);
        }
        setBookingHistoryDialogBoxOpen(false);
    };

    const handleDeleteSpot = async (spotId) => {
        try {
            const response = await axios.delete(`${BACKEND_URL}/spots/${spotId}`);
            if (response.status === 200) {
                const token = localStorage.getItem("token");
                const user_id = String(localStorage.getItem("user_id"));
                const spotRes = await axios.get(`${BACKEND_URL}/spots/owner/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookingDetails(spotRes.data);
                const total = response.data.reduce((acc, spot) => acc + spot.totalEarning, 0);
                setTotalEarning(total);
            }
        } catch (error) {
            console.error("Error deleting spot:", error);
        }
    };

    const onEditSpotClick = async (spotID) => {
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
        setSelectedSpotID(null);
    };

    const toggleEditSpot = () => {
        setEditSpotOpen(!editSpotOpen);
    };

    if (!user) return <Typography variant="h5">Loading profile...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 10 ,overflowX:"scroll"}}>
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
                    <Typography variant="h5" color="success" display="flex" alignItems="center">
                        <CurrencyRupee fontSize="small" />
                        {totalEarning}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }}>
                        Edit Profile
                    </Button>
                </Box>
            </Card>

            {/* My Spots Section */}
            <Box sx={{ overflowY: "scroll", borderRadius: 2, p: 4, backgroundColor: "lightgray" }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "black" }}>
                    My Spots
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    {userSpots.length > 0 ? (
                        userSpots.map((spot) => (
                            <Grid item xs={12} sm={6} md={4} key={spot.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        padding: 2,
                                        borderRadius: 2,
                                        height: "100%",
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold">
                                            {spot.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {spot.address}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            <strong>Description:</strong> {spot.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Open Time:</strong> {spot.openTime}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Close Time:</strong> {spot.closeTime}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Hourly Rate: ₹</strong> {spot.hourlyRate}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Open Days:</strong> {spot.openDays}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success" sx={{ mt: 1 }}>
                                            Earnings: <CurrencyRupee fontSize="small" />
                                            {spot.totalEarning}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "space-between", mt: "auto" }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => onEditSpotClick(spot.id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => onDeleteSpotClick(spot.id)}
                                        >
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
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body1" align="center" color="text.secondary">
                            No spots found.
                        </Typography>
                    )}
                </Grid>
            </Box>

            {/* Booking History Dialog */}
            {bookingHistoryDialogBoxOpen && bookingDetails.length > 0 && (
                <Dialog open={bookingHistoryDialogBoxOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <SpotBookingView bookingDetails={bookingDetails} />
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
        </Container>
    );
};

export { Profile };