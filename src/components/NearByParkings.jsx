import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, CardContent, Typography, Box, Grid, Chip, Skeleton, Stack, Divider } from "@mui/material";
import { BACKEND_URL } from "../const";
import { useNavigate } from "react-router-dom";
import { DirectionsWalk, LocalParking, CurrencyRupee, MyLocationOutlined } from "@mui/icons-material";

/**
 * NearByParkings Component
 *
 * Displays a list of nearby parking spots sorted by distance from the user current location .
 * Shows relevant information including distance, walking time, availability, and price.
 *
 * @param {Object} props - Component props
 * @param {Object} props.origin - The origin location coordinates (latitude and longitude)
 * @param {Function} props.onSpotSelect - Handler function called when a parking spot is selected
 * @param {boolean} props.isMobile - Whether the component is rendered in mobile view
 * @param {string} props.selectedDate - The date selected for parking
 * @param {string} props.startTime - The starting time for parking
 * @returns {React.ReactElement} The NearByParkings component
 */
const NearByParkings = ({ origin, onSpotSelect, isMobile, selectedDate, startTime }) => {
	const navigate = useNavigate();
	const [spots, setSpots] = useState([]);
	const [sortedMarkers, setSortedMarkers] = useState([]);
	const [loading, setLoading] = useState(true);

	/**
	 * Fetches parking spots and calculates distances from origin
	 */
	useEffect(() => {
		const fetchspot = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`${BACKEND_URL}/spotdetails/getparkingspot`);

				if (!response.data) {
					throw new Error("No data received from the server");
				}

				const fetchedMarkers = response.data;
				setSpots(fetchedMarkers);

				// Skip distance calculation if Google Maps isn't loaded or no origin provided
				if (!window.google || !origin || fetchedMarkers.length === 0) {
					setLoading(false);
					return;
				}

				const service = new window.google.maps.DistanceMatrixService();
				const destinations = fetchedMarkers.map((marker) => ({
					lat: marker.latitude,
					lng: marker.longitude,
				}));

				service.getDistanceMatrix(
					{
						origins: [origin],
						destinations,
						travelMode: window.google.maps.TravelMode.WALKING,
						unitSystem: window.google.maps.UnitSystem.METRIC,
					},
					(response, status) => {
						if (status === "OK" && response?.rows?.length > 0) {
							const updated = fetchedMarkers.map((marker, index) => {
								const element = response.rows[0]?.elements?.[index];

								return {
									...marker,
									walkingDistance: element?.distance?.text || "N/A",
									walkingDuration: element?.duration?.text || "N/A",
									rawDistance: element?.distance?.value || Infinity,
								};
							});

							const sorted = updated.sort((a, b) => a.rawDistance - b.rawDistance).slice(0, 4);
							setSortedMarkers(sorted);
						} else {
							console.error("Distance Matrix failed:", status, response);
						}
						setLoading(false);
					}
				);
			} catch (error) {
				console.error("Error fetching spot", error);
				setLoading(false);
			}
		};

		if (origin) {
			fetchspot();
		} else {
			setLoading(false);
		}
	}, [origin]);

	/**
	 * Handles click on a parking spot card
	 *
	 * @param {Object} spot - The selected parking spot data
	 */
	const handleSpotClick = (spot) => {
		onSpotSelect(spot);
		navigate("/mapsearch", {
			state: {
				locationName: origin,
				selectedDate,
				startTime,
			},
		});
	};

	return (
		<Box sx={{ my: 4, width: "100%" }}>
			{/* Section Header */}
			<Box onClick={() => handleSpotClick()}>
				<Typography
					variant={isMobile ? "subtitle1" : "h6"}
					fontWeight="bold"
					sx={{
						mb: 2,
						display: "flex",
						alignItems: "center",
						color: "text.secondary",
						borderBottom: "2px solid",
						borderColor: "primary.light",
						pb: 1,
					}}
				>
					<MyLocationOutlined sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} color="primary" />
					Nearby Parking
				</Typography>
			</Box>

			{loading ? (
				// Loading skeletons
				<Stack spacing={2}>
					{[1, 2, 3].map((item) => (
						<Skeleton key={item} variant="rounded" height={120} width="100%" sx={{ borderRadius: 4 }} />
					))}
				</Stack>
			) : sortedMarkers.length > 0 ? (
				<Stack spacing={2} sx={{ maxWidth: "100%" }}>
					{sortedMarkers.map((spot) => (
						<Card
							key={spot.spot_id}
							onClick={() => handleSpotClick(spot)}
							sx={{
								cursor: "pointer",
								borderRadius: 3,
								boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
								transition: "all 0.3s ease",
								overflow: "hidden",
								border: "1px solid",
								borderColor: "divider",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
									borderColor: "primary.light",
								},
							}}
						>
							<Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "stretch" }}>
								{/* Left color bar with parking icon */}
								<Box
									sx={{
										bgcolor: "primary.light",
										width: { xs: "100%", sm: 100 },
										height: { xs: 5, sm: "auto" },
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<LocalParking
										sx={{
											color: "white",
											fontSize: 40,
											display: { xs: "none", sm: "block" },
										}}
									/>
								</Box>

								{/* Card content */}
								<CardContent sx={{ flexGrow: 1, py: 2 }}>
									{/* Title and availability */}
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											mb: 1,
										}}
									>
										<Typography variant="h6" fontWeight="bold" sx={{ color: "text.primary" }}>
											{spot.spot_title}
										</Typography>

										<Chip
											size="small"
											label={`${spot.available_slots} spots`}
											color={spot.available_slots > 2 ? "success" : "warning"}
											sx={{ fontWeight: "bold" }}
										/>
									</Box>

									{/* Address */}
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											mb: 1.5,
											display: "-webkit-box",
											overflow: "hidden",
											WebkitBoxOrient: "vertical",
											WebkitLineClamp: 1,
										}}
									>
										{spot.address}
									</Typography>

									<Divider sx={{ my: 1.5 }} />

									{/* Price*/}
									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<CurrencyRupee sx={{ fontSize: 16, color: "success.main", mr: 0.5 }} />
											<Typography variant="body1" fontWeight="bold" color="success.main">
												₹{spot.hourly_rate}
												<Typography component="span" variant="caption" color="text.secondary">
													/hr
												</Typography>
											</Typography>
										</Box>

										{/* distance info */}
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<DirectionsWalk sx={{ fontSize: 16, color: "primary.main", mr: 0.5 }} />
											<Typography variant="body2" color="primary.main">
												{spot.walkingDistance} • {spot.walkingDuration}
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Box>
						</Card>
					))}
				</Stack>
			) : (
				<Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
					No nearby parking spots found
				</Typography>
			)}
		</Box>
	);
};

export default NearByParkings;
