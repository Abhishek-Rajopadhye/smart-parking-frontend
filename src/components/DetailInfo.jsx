import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const DetailInfo = ({ selectedMarker }) => {
	const [reviews, setReviews] = useState([]);
	const [ownerDetail, setOwnerDetail] = useState({});
	const [spotImages, setSpotImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false);
	const navigate = useNavigate();

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

	return (
		<Box sx={{ position: "absolute", width: "95%", margin: "auto", padding: 3, top: "50px" }}>
			<Paper sx={{ padding: 2, textAlign: "left" }}>
				<CardMedia
					component="img"
					height="300"
					image={spotImages[0] || "https://cdn.pixabay.com/photo/2020/05/31/09/12/park-5241887_1280.jpg"}
					alt="Parking Spot"
				/>
				<Typography variant="h4" fontWeight="bold" sx={{ mt: 2, ml: 1 }}>
					{selectedMarker.spot_title}
				</Typography>
			</Paper>

			<Grid container spacing={2} sx={{ marginTop: 1 }}>
				{/* Left Section */}
				<Grid item xs={12} md={6}>
					<Paper elevation={6} sx={{ padding: 3, height: "500px", overflow: "hidden" }}>
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
					<Paper elevation={6} sx={{ padding: 3, height: "500px", overflow: "visible"}} variant="outlined">

						<Typography
							variant="h5"
							fontWeight="bold"
							sx={{ m: 2, display: "flex", alignItems: "center" }}
						>
							Reviews
							<Box sx={{ display: "flex", justifyContent:"space-between" }}>
								<Rating name="read-only" value={averageRating} precision={0.5} readOnly />
								<Typography>({reviews.length})</Typography>
							</Box>
							<Button
								variant="outlined"
								color="primary"
								size="small"
								onClick={() => setAddReviewDialogOpen(true)} // Placeholder action
								sx={{ ml: 2, justifyContent:"space-between" }}
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
										<Grid item key={index} sx={{ bgcolor: "skyblue", borderRadius: 2, padding: 2, m:1 }}>
											<ReviewCard review={review} />
										</Grid>
									))}
								</Grid>
							</Box>
						)}
					</Paper>
				</Grid>

				{/* Image Section */}
				<Box>
					{spotImages.length > 0 && (
						<Box sx={{ mt: 3, padding: 3 }}>
							<Typography variant="h4" fontWeight="bold">
								User Uploaded Images
							</Typography>
							<ImageList cols={3} gap={8} sx={{ width: "100%", height: 170 }}>
								{spotImages.map((img, index) => (
									<ImageListItem key={index} onClick={() => setSelectedImage(img)}>
										<img src={img} alt={`Review ${index}`} loading="lazy" style={{ cursor: "pointer" }} />
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
			</Grid>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Button
					fullWidth
					variant="contained"
					color="secondary"
					sx={{ borderRadius: 2, mt: 2, fontSize: "large" }}
					onClick={toggleDialogBooking}
				>
					Book Now
				</Button>
				<Button
					variant="contained"
					color="primary"
					onClick={() => {
						navigate("/homepage");
					}}
					sx={{ borderRadius: 2, mt: 2, fontSize: "large" }}
				>
					Go Home
				</Button>
			</Box>
			<Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking} />
			<AddReview
				openDialog={addReviewDialogOpen}
				onClose={() => setAddReviewDialogOpen(false)}
				spot_id={selectedMarker.spot_id}
			/>
		</Box>
	);
};

export default DetailInfo;
