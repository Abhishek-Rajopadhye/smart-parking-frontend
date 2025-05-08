/**
 * MarkerCard Component
 *
 * Displays a list of parking spots as cards with information like price and walking distance.
 * Features include sorting, infinite scrolling, and booking functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.markers - Array of parking spot markers
 * @param {Object} props.origin - Origin location coordinates for distance calculation
 * @param {Object} props.latlng - Latitude and longitude coordinates (Note: Currently not used)
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import {
	Box,
	Typography,
	Button,
	Select,
	MenuItem,
	Card,
	CardContent,
	CardActions,
	FormControl,
	InputLabel,
	Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Booking } from "../pages/Booking";

/**
 * Skeleton placeholder for marker card during loading
 *
 * @component
 */
const MarkerSkeleton = () => (
	<Card
		sx={{
			display: "flex",
			mb: 2,
			borderRadius: 3,
			flexDirection: { xs: "column", sm: "row" },
			boxShadow: 1,
			overflow: "hidden",
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
	// const navigate = useNavigate();
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [sortedMarkers, setSortedMarkers] = useState([]);
	const [sortType, setSortType] = useState("price");
	const [bookingMarker, setBookingMarker] = useState(null);
	const [visibleMarkers, setVisibleMarkers] = useState([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const ITEMS_PER_PAGE = 2;
	const listContainerRef = useRef(null);
	const loaderRef = useRef(null);

	/**
	 * Toggle booking dialog visibility
	 */


	/**
	 * Toggle booking dialog visibility
	 */
	const toggleDialogBooking = () => {
		setDialogBookingOpen(!dialogBookingOpen);
	};

	/**
	 * Calculate walking distances for markers using Google Distance Matrix
	 */
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

		service.getDistanceMatrix(
			{
				origins: [origin],
				destinations,
				travelMode: window.google.maps.TravelMode.WALKING,
				unitSystem: window.google.maps.UnitSystem.METRIC,
			},
			(response, status) => {
				if (status === "OK" && response?.rows?.length > 0) {
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

	/**
	 * Re-sort markers when sort type changes
	 */
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

/**
	 * Load more markers when scrolling
	 */
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

	/**
	 * Set up intersection observer for infinite scrolling
	 */
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



  /**
   * Sort markers by specified criteria
   * 
   * @param {Array} markerList - Array of markers to sort
   * @param {string} type - Sort type ('price' or 'distance')
   * @returns {Array} Sorted array of markers
   */

	const sortMarkers = (markerList, type) => {
		if (type === "price") {
			return markerList.sort((a, b) => {
				if (a.hourly_rate === b.hourly_rate) {
					// If prices are the same, sort by raw distance
					return a.rawDistance - b.rawDistance;
				}
				// Otherwise, sort by price
				return a.hourly_rate - b.hourly_rate;
			});
		} else if (type === "distance") {
			return markerList.sort((a, b) => {
				// Round distances to nearest 0.1 km for comparison
				const distA = Math.round((a.rawDistance / 1000) * 10); 
				const distB = Math.round((b.rawDistance / 1000) * 10);

				if (distA === distB) {
					// If rounded distances are the same, sort by price
					return a.hourly_rate - b.hourly_rate;
				}
				// Otherwise, sort by rounded distance
				return distA - distB;
			});
		}
		return markerList;
	};

	/**
	 * Handle sort type change
	 *
	 * @param {Object} event - Change event
	 */
	const handleSortChange = (event) => {
		const newType = event.target.value;
		setSortType(newType);
	};

	return (
		<Box sx={{ p: 2, bgcolor: "#f9f9f9" }} ref={listContainerRef}>
			{/* Sort control */}
			<FormControl fullWidth size="small" sx={{ mb: 2 }}>
				<InputLabel>Sort by</InputLabel>
				<Select value={sortType} label="Sort by" onChange={handleSortChange}>
					<MenuItem value="price">Price</MenuItem>
					<MenuItem value="distance">Distance</MenuItem>
				</Select>
			</FormControl>

			{/* Show message when no parking spots are found */}
			{visibleMarkers.length === 0 && !loading ? (
				<Typography align="center" sx={{ mt: 4 }}>
					No parking spots found
				</Typography>
			) : (
				/* Display parking spot cards */
				visibleMarkers.map((spot) => (
					<Card
						key={spot.spot_id}
						sx={{ display: "flex", mb: 2, borderRadius: 3, flexDirection: "column", boxShadow: 2 }}
					>
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

							{/* Only show booking button if not owned by current user */}
							{spot.owner_id != "google-oauth2|1234567890" && (
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
							)}
						</CardActions>
					</Card>
				))
			)}

			{/* Infinite scroll loader */}
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
					{loading && <MarkerSkeleton />}
				</Box>
			)}

			{bookingMarker && (
				<Booking spot_information={bookingMarker} open={dialogBookingOpen} set_dialog={toggleDialogBooking} />
			)}
		</Box>
	);
};

export default MarkerCard;
