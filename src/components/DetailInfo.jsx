/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
	Grid,
	Paper,
	Typography,
	Chip,
	Box,
	Rating,
	Avatar,
	ImageList,
	ImageListItem,
	CardMedia,
	Card,
	Button,
	ButtonBase,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import axios from "axios";

const DetailInfo = ({ selectedMarker, user }) => {
	const [reviews, setReviews] = useState([]);

	useEffect(() => {
		const fetchDetails = async () => {
			try {
				const response = await axios.get(`http://127.0.0.1:8000/review/spot/${selectedMarker.spot_id}`);
				const data = await response.json();
				console.log("Received data ", data);
				setReviews(data);
			} catch (error) {
				console.error("Error fetching Reviews", error);
				// SpeechSynthesisErrorEvent("failed to load parking spots. Please try again.");
			}
		};

		fetchDetails();
	}, [selectedMarker.spot_id]);

	console.log(reviews);
	console.log("Received selected marker", selectedMarker, user);

	return (
		<Box sx={{ width: "80%", margin: "auto", padding: 3 }}>
			<Paper sx={{ padding: 2, textAlign: "center" }}>
				<CardMedia
					component="img"
					height="200"
					image="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
					alt="No images available  dish"
				/>

				<Typography variant="h4" fontWeight="bold">
					{selectedMarker.spot_title}
				</Typography>
			</Paper>
			<Grid container sx={{ marginTop: 2 }}>
				{/* Left  */}
				<Grid xs={12} md={6} sx={{ padding: 1 }}>
					<Paper elevation="6" sx={{ padding: 3 }}>
						<Box sx={{ mt: 2, padding: 1 }}>
							<Typography variant="h4">
								{" "}
								<AccountBoxIcon sx={{ mr: 2 }} /> {user.name}
							</Typography>
						</Box>

						<Box sx={{ mt: 2, padding: 1 }}>
							<Typography variant="h4">
								<PhoneIcon sx={{ mr: 2 }} />
								{user?.number || "Contact not available"}
							</Typography>

							<Typography variant="h5" sx={{ ml: 2 }}>
								{user.email || "Email not provided "}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", padding: 1, mt: 2 }}>
							<LocationOnIcon sx={{ mr: 2 }} />
							<Typography variant="h5" fontWeight="bold">
								{selectedMarker.address}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", mt: 2, padding: 1 }}>
							<CalendarTodayIcon sx={{ mt: 1, mr: 2 }} />

							<Grid container spacing={1} sx={{ mt: 0, justifyContent: "flex-start" }}>
								{selectedMarker.available_days.map((day, index) => (
									<Grid item key={index}>
										<Chip label={day.slice(0, 3).toUpperCase()} color="primary" size="small" />
									</Grid>
								))}
							</Grid>
						</Box>

						<Box sx={{ mt: 2, padding: 1 }}>
							<Typography variant="h5">
								{" "}
								<AccessTimeIcon sx={{ mr: 2 }} />
								{selectedMarker.open_time} to {selectedMarker.close_time}
							</Typography>
						</Box>

						<Box sx={{ mt: 2, padding: 1 }}>
							<Typography variant="h5">
								{" "}
								<LocalParkingIcon sx={{ mr: 1 }} /> Avalable Slots :{selectedMarker.available_slots}{" "}
							</Typography>
						</Box>
					</Paper>
				</Grid>

				{/* Right Section */}

				<Grid item xs={12} md={6} sx={{ padding: 1 }}>
					<Paper elevation="6" sx={{ padding: 3 }}>
						<Typography variant="h6">Left Section</Typography>

						<Box padding={0} display="flex" sx={{ justifyContent: "flex-start" }}>
							<Rating name="read-only" value={4} readOnly /> <Typography>(10)</Typography>
						</Box>

						<Box bgcolor="skyblue" sx={{ padding: 2, borderRadius: 2, width: "100%" }}>
							<Typography variant="h6" fontWeight="bold">
								Review
							</Typography>

							<Grid container direction="column" spacing={2} width="100%">
								<Grid item>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Typography fontWeight="bold">Pradeep </Typography>

										<Typography>20-8-2025</Typography>

										<Rating name="read-only" value={4} readOnly />
									</Box>

									<Box bgcolor="gray" sx={{ padding: 2, borderRadius: 4, marginTop: 1 }}>
										<Typography color="white">Lorem, ipnl molestiae {reviews}uu</Typography>
									</Box>
								</Grid>
								<Grid item>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Typography fontWeight="bold">Pradeep </Typography>

										<Typography>20-8-2025</Typography>

										<Rating name="read-only" value={4} readOnly />
									</Box>

									<Box bgcolor="gray" sx={{ padding: 2, borderRadius: 4, marginTop: 1 }}>
										<Typography color="white">{reviews}</Typography>
									</Box>
								</Grid>
							</Grid>

							<Button variant="text">Read more ..</Button>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

const itemData = [
	{
		img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
		title: "Breakfast",
	},

	{
		img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
		title: "Burger",
	},

	{
		img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
		title: "Camera",
	},

	{
		img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
		title: "Breakfast",
	},

	{
		img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
		title: "Burger",
	},

	{
		img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
		title: "Camera",
	},

	{
		img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
		title: "Breakfast",
	},

	{
		img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
		title: "Burger",
	},

	{
		img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
		title: "Camera",
	},
];

const days = ["Monday", "tuesday", "wednesday"];

export default DetailInfo;
