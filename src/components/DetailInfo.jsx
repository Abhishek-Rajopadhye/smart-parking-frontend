import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	Grid,
	Paper,
	Typography,
	Chip,
	Box,
	Rating,
	Avatar,
	CardMedia,
	Button,
	ImageList,
	ImageListItem,
	Dialog,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import axios from "axios";
import { BACKEND_URL } from "../const";
import { Booking } from "../pages/Booking";
import { ReviewCard } from "./ReviewCard";
import { AddReview } from "./AddReview";

const DetailInfo = () => {
	const { spot_id } = useParams();
	const [selectedMarker, setSelectedMarker] = useState([]);
	console.log("dpot", spot_id);

	useEffect(() => {
		// Fetch the spot details from your API
		fetch(`${BACKEND_URL}/spotdetails/get-spot/${spot_id}`)
			.then((response) => response.json())
			.then((data) => {
				setSelectedMarker(data);
			})
			.catch((error) => console.error("Error fetching spot details:", error));
	}, [spot_id]);

	const [reviews, setReviews] = useState([]);
	const [ownerDetail, setOwnerDetail] = useState({});
	const [spotImages, setSpotImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false);
	console.log("slected amrker", ownerDetail);
	useEffect(() => {
		const fetchDetails = async () => {
			try {
				const [reviewsRes, ownerRes] = await Promise.all([
					axios.get(`${BACKEND_URL}/reviews/spot/${selectedMarker.spot_id}`),
					axios.get(`${BACKEND_URL}/users/owner/${selectedMarker.owner_id}`),
				]);
				setReviews(reviewsRes.data);

				// Extract images from reviews where image is not null
				setOwnerDetail(ownerRes.data);
			} catch (error) {
				console.error("Error fetching data", error);
			}
		};

		const getImages = async () => {
			try {
				const { data, status } = await axios.get(`${BACKEND_URL}/spotdetails/get-images/${selectedMarker.spot_id}`);
				if (status === 200 && Array.isArray(data.images)) {
					// data.images is ["iVBORw0KG…", "R0lGODlh…", …]
					setSpotImages(data.images.map((b64) => `data:image/png;base64,${b64}`));
				}
			} catch (error) {
				console.error("Error fetching spot images:", error);
			}
		};

		if (selectedMarker.spot_id && selectedMarker.owner_id) {
			fetchDetails();
			getImages();
		}
	}, [selectedMarker.spot_id, selectedMarker.owner_id]);

	const averageRating =
		reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating_score, 0) / reviews.length : 0;

	const toggleDialogBooking = () => {
		setDialogBookingOpen(!dialogBookingOpen);
	};

	const handleAddReviewClose = async () => {
		const response = await axios.get(`${BACKEND_URL}/reviews/spot/${selectedMarker.spot_id}`);
		if (response.status == 200) {
			setReviews(response.data);
		}
		setAddReviewDialogOpen(false);
	};

	const handleDeleteReview = async (review_id) => {
		const response = await axios.delete(`${BACKEND_URL}/reviews/${review_id}`);
		if (response.status == 200) {
			setReviews(reviews.filter((review) => review.id !== review_id));
		}
	};

	const handleEditReview = async (review_id, updatedReview) => {
		const response = await axios.put(`${BACKEND_URL}/reviews/${review_id}`, updatedReview);
		if (response.status == 200) {
			setReviews(response.data);
		}
	}

	return (
		<Box
			sx={{
				width: "100%",
				padding: { xs: 2, sm: 3, md: 4 },
				boxSizing: "border-box",
				overflowX: "hidden", // 🚫 Disable horizontal scrolling
			}}
		>
			<Paper
				sx={{
					textAlign: "center",
					py: { xs: 2, sm: 3 },
					px: { xs: 1, sm: 2 },
					mb: 3,
					backgroundColor: "#f5f5f5",
					borderRadius: 3,
				}}
			>
				<Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}>
					{selectedMarker.spot_title}
				</Typography>
			</Paper>
			{/* Image Section */}
			<Box>
				{spotImages.length > 0 && (
					<Box sx={{ mt: 4 }}>
						<Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
							Spot Images
						</Typography>
						<ImageList cols={3} gap={8} sx={{ width: "100%", height: 170 }}>
							{spotImages.map((img, index) => (
								<ImageListItem key={index} onClick={() => setSelectedImage(img)}>
									<img src={img} alt={`Spot ${index}`} loading="lazy" style={{ cursor: "pointer" }} />
								</ImageListItem>
							))}
						</ImageList>
					</Box>
				)}
				{/* Image Enlargement Dialog */}
				<Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)}>
					<img
						src={selectedImage}
						alt="Enlarged"
						style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
					/>
				</Dialog>
			</Box>

			<Grid container spacing={3} sx={{ marginTop: 1 }}>
				{/* Left Section */}
				<Grid item xs={12} md={6}>
					<Paper elevation={6} sx={{ padding: 3, height: "100%", overflow: "hidden" }}>
						<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
							<Avatar alt="Owner" src={ownerDetail.profile_picture} sx={{ mr: 2, width: 56, height: 56 }} />
							<Typography variant="h5">{ownerDetail.name || "Unknown Owner"}</Typography>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography variant="h6">
								<PhoneIcon sx={{ mr: 2 }} /> {ownerDetail.phone || "Contact not available"}
							</Typography>
							<Typography variant="h6" sx={{ ml: 6 }}>
								{ownerDetail.email || "Email not provided"}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", mt: 2 }}>
							<LocationOnIcon sx={{ mr: 2, color: "red" }} />
							<Typography variant="h6" color="primary">
								{selectedMarker.address}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
							<CurrencyRupeeIcon sx={{ mr: 2, color: "green" }} />
							<Typography variant="h6">{selectedMarker.hourly_rate} (1 Hr)</Typography>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
							<AccessTimeIcon sx={{ mr: 2 }} />
							<Typography variant="h6">
								{selectedMarker.open_time} to {selectedMarker.close_time}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", mt: 2 }}>
							<CalendarTodayIcon sx={{ mr: 2 }} />
							<Grid container spacing={1}>
								{Array.isArray(selectedMarker.available_days) ? (
									selectedMarker.available_days.map((day, index) => (
										<Grid item key={index}>
											<Chip label={day.slice(0, 3).toUpperCase()} color="primary" size="medium" />
										</Grid>
									))
								) : (
									<Typography variant="h6">No available days</Typography>
								)}
							</Grid>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
							<LocalParkingIcon sx={{ mr: 2 }} />
							<Typography variant="h6">Available Slots: {selectedMarker.available_slots}</Typography>
						</Box>
					</Paper>
				</Grid>

				{/* Right Section */}
				<Grid item xs={12} md={6}>
					<Paper elevation={6} sx={{ padding: 3, height: "500px", overflow: "visible" }} variant="outlined">
						<Typography variant="h5" fontWeight="bold" sx={{ m: 2, display: "flex", alignItems: "center" }}>
							Reviews
							<Box sx={{ display: "flex", justifyContent: "space-between" }}>
								<Rating name="read-only" value={averageRating} precision={0.5} readOnly />
								<Typography>({reviews.length})</Typography>
							</Box>
							<Button
								variant="outlined"
								color="primary"
								size="small"
								onClick={() => setAddReviewDialogOpen(true)} // Placeholder action
								sx={{ ml: 2, justifyContent: "space-between" }}
							>
								Add Review
							</Button>
						</Typography>
						{/*Scroble review*/}
						{reviews.length === 0 ? (
							<Typography variant="h6" sx={{ mt: 2, color: "gray", textAlign: "center" }}>
								No reviews available
							</Typography>
						) : (
							<Box sx={{ height: "400px", overflowY: "auto", padding: 2 }}>
								<Grid container direction="column" spacing={2}>
									{reviews.map((review, index) => (
										<Grid item key={index} sx={{ bgcolor: "skyblue", borderRadius: 2, padding: 2, m: 1 }}>
											<ReviewCard review={review} handleDeleteReview={()=>{handleDeleteReview(review.id)}} handleEditReview={()=>{handleEditReview}} />
										</Grid>
									))}
								</Grid>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Button
					fullWidth
					variant="contained"
					color="primary"
					sx={{ borderRadius: 2, mt: 2, fontSize: "large" }}
					onClick={toggleDialogBooking}
				>
					Book Now
				</Button>
			</Box>
			<Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking} />
			<AddReview
				openDialog={addReviewDialogOpen}
				onClose={() => handleAddReviewClose()}
				spot_id={selectedMarker.spot_id}
			/>
		</Box>
	);
};

export default DetailInfo;
