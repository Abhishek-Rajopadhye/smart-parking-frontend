/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useRef, useState } from "react";
import {
	Box,
	Typography,
	Button,
	Select,
	MenuItem,
	Card,
	CardMedia,
	CardContent,
	CardActions,
	FormControl,
	InputLabel,
	CircularProgress,
	Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Booking } from "../pages/Booking";


// Skeleton placeholder for marker card
const MarkerSkeleton = () => (
	<Card
	  sx={{ 
		display: "flex",
		mb: 2,
		borderRadius: 3,
		flexDirection: { xs: "column", sm: "row" },
		boxShadow: 1,
		overflow: "hidden"
	  }}
	>
	  <Skeleton variant="rectangular" width={100} height={100} />
  
	  <Box sx={{ flex: 1, p: 1.5 }}>
		<Skeleton width="70%" height={20} sx={{ mb: 1 }} />
		<Skeleton width="50%" height={20} />
		<Box sx={{ mt: 2 }}>
		  <Skeleton width="40%" height={30} />
		</Box>
	  </Box>
	</Card>
  );
  

const MarkerCard = ({ markers, origin, latlng }) => {
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [sortedMarkers, setSortedMarkers] = useState([]);
	const [sortType, setSortType] = useState("price");
	const [bookingMarker, setBookingMarker] = useState(null);
	const [visibleMarkers, setVisibleMarkers] = useState([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const loaderRef = useRef(null);
	const ITEMS_PER_PAGE = 2;
	const listContainerRef = useRef(null);

	// console.log("booking marker", markers);
	const navigate = useNavigate();
	//  console.log("Origin",origin)
	//  console.log("lat.l",latlng);
	//  console.log("ON the marker card ",markers);
	// Calculate walking time & distance

	const toggleDialogBooking = () => {
		setDialogBookingOpen(!dialogBookingOpen);
	};

	useEffect(() => {
		if (!window.google || !origin) return;

		if (markers.length === 0) {
			setSortedMarkers([]);
			setVisibleMarkers([]);
			return;
		}

		setLoading(true);

		const service = new window.google.maps.DistanceMatrixService();
		const destinations = markers.map((marker) => ({
			lat: marker.latitude,
			lng: marker.longitude,
		}));

		//  console.log("Destinations:", destinations);
		// console.log(" :", destinations);
		service.getDistanceMatrix(
			{
				origins: [origin],
				destinations,
				travelMode: window.google.maps.TravelMode.WALKING,
				unitSystem: window.google.maps.UnitSystem.METRIC,
			},
			(response, status) => {
				if (status === "OK" && response?.rows?.length > 0) {
					// console.log("Distance Matrix Response:", response);

					const updated = markers.map((marker, index) => {
						const element = response.rows[0]?.elements?.[index];

						return {
							...marker,
							walkingDistance: element?.distance?.text || "N/A",
							walkingDuration: element?.duration?.text || "N/A",
							rawDistance: element?.distance?.value || Infinity,
						};
					});
					const sortedListOfMarkers = sortMarkers(updated, sortType);
					setSortedMarkers(sortedListOfMarkers);

					// Initialize visible markers with first page
					setVisibleMarkers(sortedListOfMarkers.slice(0, ITEMS_PER_PAGE));
					setPage(1);
					setLoading(false);
				} else {
					console.error("Distance Matrix failed:", status, response);
					setLoading(false);
				}
			}
		);
	}, [markers, origin]);

	// useEffect(()=>{

	// 	const getImages = async () => {
	// 		try {
	// 			const { data } = await axios.get(`${BACKEND_URL}/spotdetails/get-images/${selectedMarker.spot_id}`);
	// 			setSpotImages(data.images.map((b64) => `data:image/png;base64,${b64}`));
	// 		} catch (err) {
	// 			console.error("Image Error:", err);
	// 		}
	// 	};

	// 	getImages();
	// },[markers])

	// const calculateDistance = (origin, destination) => {
	//     try {
	//         if (!window.google?.maps?.geometry) return null;

	//         if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
	//             throw new Error("Invalid coordinates provided for distance calculation");
	//         }

	//         const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);

	//         const destinationLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

	//         // Distance in meters
	//         const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
	//             originLatLng,
	//             destinationLatLng
	//         );

	//         // Converting  km with 2 decimal places
	//         return (distanceInMeters / 1000).toFixed(2);
	//     } catch (error) {
	//         console.error("Distance claculation error:", error);
	//         return null;
	//     }
	// };

	// Update when sort type changes
	useEffect(() => {
		if (sortedMarkers.length > 0) {
			const sortedListOfMarkers = sortMarkers([...sortedMarkers], sortType);
			setSortedMarkers(sortedListOfMarkers);
			setVisibleMarkers(sortedListOfMarkers.slice(0, ITEMS_PER_PAGE));
			setPage(1);

			// Reset scroll position when sort type changes
			if (listContainerRef.current) {
				listContainerRef.current.scrollTop = 0;
			}
		}
	}, [sortType]);

	// Set up intersection observer for infinite scrolling
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && !loading && visibleMarkers.length < sortedMarkers.length) {
					// Load more markers when the loader element is visible
					loadMoreMarkers();
				}
			},
			{ threshold: 0.1 }
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [visibleMarkers, sortedMarkers, loading]);

	const loadMoreMarkers = () => {
		if (loading) return;

		setLoading(true);

		// Small timeout to prevent too rapid loading
		setTimeout(() => {
			const nextPage = page + 1;
			const newVisibleMarkers = [
				...visibleMarkers,
				...sortedMarkers.slice(page * ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE),
			];

			setVisibleMarkers(newVisibleMarkers);
			setPage(nextPage);
			setLoading(false);
		}, 300);
	};

	const sortMarkers = (markerList, type) => {
		if (type === "price") {
			return markerList.sort((a, b) => {
				if (a.hourly_rate === b.hourly_rate) {
					// If prices are the same, sort by distance
					return a.rawDistance - b.rawDistance;
				}
				// Otherwise, sort by price
				return a.hourly_rate - b.hourly_rate;
			});
		} else if (type === "distance") {
			return markerList.sort((a, b) => {
				if (a.rawDistance === b.rawDistance) {
					// If distances are the same, sort by price
					return a.hourly_rate - b.hourly_rate;
				}
				// Otherwise, sort by distance
				return a.rawDistance - b.rawDistance;
			});
		}
		return markerList;
	};

	const handleSortChange = (event) => {
		const newType = event.target.value;
		setSortType(newType);
	};

	//   console.log("Sorted log",sortedMarkers);

	return (
		<Box sx={{ p: 2, bgcolor: "#f9f9f9",height: "calc(100vh - 64px)" }} ref={listContainerRef}>
			<FormControl fullWidth size="small" sx={{ mb: 2 }}>
				<InputLabel>Sort by</InputLabel>
				<Select value={sortType} label="Sort by" onChange={handleSortChange}>
					<MenuItem value="price">Price</MenuItem>
					<MenuItem value="distance">Distance</MenuItem>
				</Select>
			</FormControl>

			{visibleMarkers.length === 0 && !loading ? (
				<Typography align="center" sx={{ mt: 4 }}>
					No parking spots found
				</Typography>
			) : (
				visibleMarkers.map((spot) => (
					<Card
						key={spot.spot_id}
						sx={{ display: "flex", mb: 2, borderRadius: 3, flexDirection: "column", boxShadow: 2 }}
					>
						{/* <CardMedia
							component="img"
							image={spot.image || "/placeholder.jpg"}
							alt={spot.spot_title}
							sx={{ width: 100, height: 100, borderRadius: "12px 0 0 12px" }}
						/> */}

						<CardContent sx={{ pb: 1 }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<Typography
									fontWeight="bold"
									noWrap
									sx={{
										fontSize: "0.8rem",
										//  whiteSpace: "normal",
										maxWidth: "75%",
									}}
								>
									{spot.spot_title}
								</Typography>
								<Typography fontWeight="bold" color="green">
									₹ {spot.hourly_rate}
								</Typography>
							</Box>

							<Typography
								variant="body2"
								color="text.secondary"
								sx={{
									whiteSpace: "normal",
									wordBreak: "break-word",
									maxWidth: "85%",
								}}
							>
								🚶 {spot.walkingDuration} ({spot.walkingDistance})
								{/* ({calculateDistance({ lat: latlng.lat, lng: latlng.lng}, { lat: spot.latitude, lng: spot.longitude })} km ) */}
							</Typography>
						</CardContent>

						<CardActions>
							<Button
								size="small"
								onClick={() => {
									navigate(`/spotdetail/${spot.spot_id}`);
									console.log("Inside navigate ", spot.spot_id);
								}}
								variant="text"
							>
								Details
							</Button>
							<Button
								size="small"
								color="success"
								onClick={() => {
									console.log("SPott", spot);
									setBookingMarker(spot);
									toggleDialogBooking();
								}}
							>
								Book{" "}
							</Button>
						</CardActions>
					</Card>
				))
			)}
			{visibleMarkers.length < sortedMarkers.length && (
				<Box
					ref={loaderRef}
					sx={{
						display: "flex",
						justifyContent: "center",
						py: 2,
						height: 60,
					}}
				>
					{loading && <CircularProgress size={30} />}
				</Box>
			)}

			{bookingMarker && (
				<Booking spot_information={bookingMarker} open={dialogBookingOpen} set_dialog={toggleDialogBooking} />
			)}
		</Box>
	);
};

export default MarkerCard;
