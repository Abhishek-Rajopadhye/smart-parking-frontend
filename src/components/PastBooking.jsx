/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
	Card,
	CardContent,
	Typography,
	Button,
	Box,
	Grid,
	Chip,
	Divider,
	CircularProgress,
	Container,
	CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
	HistoryOutlined,
	AccessTimeOutlined,
	LocationOnOutlined,
	EventOutlined,
	PaymentOutlined,
	CheckCircle,
} from "@mui/icons-material";
import { BACKEND_URL } from "../const";
import { AuthContext } from "../context/AuthContext";
import { Booking } from "../pages/Booking";

const PastBooking = ({ user, isMobile }) => {
	const [recentBookings, setRecentBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [selectedMarker, setSelectedMarker] = useState([]);
	const [previousBookingData, setPreviousBookingData] = useState(null);

	const toggleDialogBooking = () => setDialogBookingOpen(!dialogBookingOpen);

	const handleBooking = async (previous_booking) => {
		if (!previous_booking.spot_id) return;
		setDialogBookingOpen(!dialogBookingOpen);

		try {
			const response = await axios.get(`${BACKEND_URL}/spotdetails/get-spot/${previous_booking.spot_id}`);
			if (response.status === 200) {
				const data = response.data;
				setSelectedMarker(data);
			}
			setPreviousBookingData(previous_booking);
		} catch (err) {
			console.error("Error fetching spot details :", err);
		}
	};

	useEffect(() => {
		const fetchDetailsUserBookings = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
				if (response.status === 200) {
					// Sort by latest and pick top 4
					const sorted = response.data.sort((a, b) => b.id - a.id).slice(0, 4);
					setRecentBookings(sorted);
				}
			} catch (error) {
				console.error("Error fetching user bookings:", error);
			} finally {
				setLoading(false);
			}
		};

		if (user?.id) fetchDetailsUserBookings();
	}, [user?.id]);

	// Format date and time to be more readable
	const formatDateTime = (dateTimeStr) => {
		try {
			const [date, time] = dateTimeStr.split(", ");
			return { date, time };
		} catch (error) {
			return { date: dateTimeStr, time: "" };
		}
	};

	// Calculate total duration in hours
	const calculateDuration = (start, end) => {
		try {
			const startDate = new Date(start.replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3"));
			const endDate = new Date(end.replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3"));
			const diffHours = (endDate - startDate) / (1000 * 60 * 60);
			return Math.round(diffHours * 10) / 10;
		} catch {
			return "N/A";
		}
	};

	// Helper function to determine status color
	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "completed":
				return "success";
			case "pending":
				return "warning";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	return (
		<Container>
			<Box sx={{ mb: 3, mt: 2 }}>
				<Typography
					variant="h5"
					component="h2"
					sx={{
						mb: 2,
						display: "flex",
						alignItems: "center",
						color: "GrayText",
						borderBottom: "2px solid",
						borderColor: "primary.light",
						pb: 1,
					}}
				>
					<HistoryOutlined sx={{ mr: 1 }} />
					Recent Bookings
				</Typography>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
						<CircularProgress />
					</Box>
				) : recentBookings.length === 0 ? (
					<Card variant="outlined" sx={{ p: 3, textAlign: "center", bgcolor: "background.paper" }}>
						<Typography variant="body1" color="text.secondary">
							No recent bookings found. Book a parking spot to see your history here.
						</Typography>
					</Card>
				) : (
					<Grid container spacing={2}>
						{recentBookings.map((booking) => {
							const { date: startDate, time: startTime } = formatDateTime(booking.start_date_time);
							const { time: endTime } = formatDateTime(booking.end_date_time);
							const duration = calculateDuration(booking.start_date_time, booking.end_date_time);
							const startTimeWithoutSeconds = startTime.slice(0, 5) + startTime.slice(8); // "11:00 am"
							const endTimeWithoutSeconds = endTime.slice(0, 5) + endTime.slice(8);
							return (
								<Grid item xs={12} sm={12} key={booking.id}>
									<Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
										<CardContent sx={{ flex: "1 0 auto" }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
													mb: 1,
												}}
											>
												<Typography variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
													{booking.spot_title}
												</Typography>
												<Chip
													label={booking.status}
													size="small"
													color={getStatusColor(booking.status)}
													variant="outlined"
												/>
											</Box>

											<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
												<LocationOnOutlined fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
												<Typography variant="body2" color="text.secondary">
													{booking.spot_address}
												</Typography>
											</Box>

											<Divider sx={{ my: 1.5 }} />

											<Grid container spacing={1}>
												<Grid item xs={6}>
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<EventOutlined
															fontSize="small"
															sx={{ color: "text.secondary", mr: 1 }}
														/>
														<Typography variant="body2">{startDate}</Typography>
													</Box>
												</Grid>
												<Grid item xs={6}>
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<AccessTimeOutlined
															fontSize="small"
															sx={{ color: "text.secondary", mr: 1 }}
														/>
														<Typography variant="body2">
															{startTimeWithoutSeconds} <br /> {endTimeWithoutSeconds}
														</Typography>
													</Box>
												</Grid>
												<Grid item xs={6}>
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<PaymentOutlined
															fontSize="small"
															sx={{ color: "text.secondary", mr: 1 }}
														/>
														<Typography variant="body2">₹{booking.payment_amount}</Typography>
													</Box>
												</Grid>
												<Grid item xs={6}>
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<AccessTimeOutlined
															fontSize="small"
															sx={{ color: "text.secondary", mr: 1 }}
														/>
														<Typography variant="body2">{duration} hours</Typography>
													</Box>
												</Grid>
											</Grid>

											{booking.payment_status === "success" && (
												<Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
													<CheckCircle fontSize="small" sx={{ color: "success.main", mr: 0.5 }} />
													<Typography variant="body2" color="success.main">
														Payment Successful
													</Typography>
												</Box>
											)}
										</CardContent>
										<CardActions sx={{ p: 2, pt: 0 }}>
											<Button
												variant="contained"
												size="small"
												fullWidth
												onClick={() => handleBooking(booking)}
											>
												Book Now
											</Button>
										</CardActions>
									</Card>
								</Grid>
							);
						})}
					</Grid>
				)}

				<Booking
					open={dialogBookingOpen}
					spot_information={selectedMarker}
					set_dialog={toggleDialogBooking}
					previous_booking={previousBookingData}
				/>
			</Box>
		</Container>
	);
};

export default PastBooking;
