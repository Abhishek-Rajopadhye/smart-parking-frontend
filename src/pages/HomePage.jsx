/* eslint-disable no-unused-vars */
/**
 * HomePage Component for  Parking Application
 *
 * This component is the main landing page for the parking app,display
 * search functionality, nearby parking options, user past booking and
 * informational content about how the website work
 *
 * Features:
 * -Location search with autocomlete suggestions
 * -Current location detection
 * -Navigatin to parking spots
 * -Past booking history for logged-in users
 * -Responsive design with different layouts for mobile and desktop
 *
 * @component
 * @param {function } props.setSeletedMarker -function to set the seleted marker on the map
 * @param {function } props.setNewMarker - function to set a new search marker on the map
 * @param {Object} props.newMarker - Current Search marker
 * @param {Function} props.setFilters - Function to update search filters
 */

import React, { useState, useRef, useEffect, useContext } from "react";
import {
	Dialog,
	Grid,
	Divider,
	useTheme,
	useMediaQuery,
	Skeleton,
	Snackbar,
	Alert,
	Button,
	Card,
	CardContent,
	Typography,
	Box,
	CardActions,
	Stack,
} from "@mui/material";

import { IoLocationSharp } from "react-icons/io5";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import parking from "../assets/images/parkingSpace.jpg";
import { useNavigate } from "react-router-dom";
import { MapContext } from "../context/MapContext";
import { AddSpotUser } from "./AddSpotUser";
import SearchBar from "../components/SearchBar";
import { addMinutes, setMinutes } from "date-fns";
import NearByParkings from "../components/NearByParkings";
import PastBooking from "../components/PastBooking";
import { AuthContext } from "../context/AuthContext";

/**
 * Displays a loading indicator with message while the app initializes
 *
 * @component
 * @returns {JSX.Element} Loading message UI
 */
const LoadingMessage = () => (
	<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
		<Box sx={{ textAlign: "center" }}>
			<DirectionsCarIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
			<Typography variant="h6">Loading Smart Parking</Typography>
			<Typography variant="body2" color="text.secondary">
				Finding the best spots for you...
			</Typography>
		</Box>
	</Box>
);

/**
 * @component
 * @param {object } props -Component props
 * @param {string} props.message - Error message to display
 * @returns  {JSX.Element} Error message UI with retry option
 */
const ErrorMessage = ({ message }) => (
	<Box sx={{ p: 3, textAlign: "center" }}>
		<Typography variant="h6" color="error">
			{message || "Error loading Google Maps"}
		</Typography>
		<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
			Please check your internet connection and try again.
		</Typography>
		<Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
			Retry
		</Button>
	</Box>
);

/**
 * Skeleton placeholder for parking spot cards during loading
 *
 * @component
 * @returns {JSX.Element} Skeleton UI for a parking spot card
 */
const SkeletonCard = () => (
	<Card
		sx={{
			borderRadius: 3,
			boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
			overflow: "hidden",
			border: "1px solid",
			borderColor: "divider",
		}}
	>
		<Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "stretch" }}>
			<Box
				sx={{
					bgcolor: "grey.200",
					width: { xs: "100%", sm: 100 },
					height: { xs: 5, sm: "auto" },
				}}
			/>

			<CardContent sx={{ flexGrow: 1, py: 2, width: "100%" }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
					<Skeleton variant="text" width="60%" height={28} />
					<Skeleton variant="rounded" width={80} height={24} />
				</Box>

				<Skeleton variant="text" width="85%" height={20} sx={{ mb: 1.5 }} />

				<Divider sx={{ my: 1.5 }} />

				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Skeleton variant="text" width={60} height={24} />
					<Skeleton variant="text" width={120} height={24} />
				</Box>
			</CardContent>
		</Box>
	</Card>
);

/**
 * Skeleton placeholder for booking history during loading
 *
 * @component
 * @returns {JSX.Element} Skeleton UI for booking history section
 */
const BookingSkeleton = () => {
	return (
		<React.Fragment>
			<Grid container spacing={2}>
				{[1, 2, 3, 4].map((item) => (
					<Grid item xs={12} sm={6} key={item}>
						<Card variant="outlined" sx={{ height: "100%" }}>
							<CardContent>
								<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
									<Skeleton variant="text" width="60%" height={32} />
									<Skeleton variant="rectangular" width={60} height={24} />
								</Box>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
									<Skeleton variant="text" width="90%" height={24} />
								</Box>
								<Divider sx={{ my: 1.5 }} />
								<Grid container spacing={1}>
									{[1, 2, 3, 4].map((subItem) => (
										<Grid item xs={6} key={subItem}>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
												<Skeleton variant="text" width="80%" height={24} />
											</Box>
										</Grid>
									))}
								</Grid>
								<Box sx={{ mt: 1 }}>
									<Skeleton variant="text" width="40%" height={24} />
								</Box>
							</CardContent>
							<CardActions sx={{ p: 2, pt: 0 }}>
								<Skeleton variant="rectangular" width="100%" height={36} />
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>
			<Grid container spacing={2}>
				{[1, 2, 3, 4].map((item) => (
					<Grid item xs={12} sm={6} key={item}>
						<Card variant="outlined" sx={{ height: "100%" }}>
							<CardContent>
								<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
									<Skeleton variant="text" width="60%" height={32} />
									<Skeleton variant="rectangular" width={60} height={24} />
								</Box>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
									<Skeleton variant="text" width="90%" height={24} />
								</Box>
								<Divider sx={{ my: 1.5 }} />
								<Grid container spacing={1}>
									{[1, 2, 3, 4].map((subItem) => (
										<Grid item xs={6} key={subItem}>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
												<Skeleton variant="text" width="80%" height={24} />
											</Box>
										</Grid>
									))}
								</Grid>
								<Box sx={{ mt: 1 }}>
									<Skeleton variant="text" width="40%" height={24} />
								</Box>
							</CardContent>
							<CardActions sx={{ p: 2, pt: 0 }}>
								<Skeleton variant="rectangular" width="100%" height={36} />
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>
		</React.Fragment>
	);
};

/**
 * Main HomePage component for the Parking application
 *
 * @component
 * @param {Object} props - component props
 * @param {Function} props.setSelectedMarker - function to set the selected marker on the map
 * @param {Function} props.setNewMarker - Function to set a new marker on the map
 * @param {Object} props.newMarker - Current new marker object
 * @param {Function} props.setFilters - Function to update search filters
 * @returns {JSX.Element} HomePage UI with search, nearby parkings,past bookings and how the website work
 */
const HomePage = ({ setSelectedMarker, setNewMarker, newMarker, setFilters }) => {
	const { user } = useContext(AuthContext);
	const { isLoaded, loadError } = useContext(MapContext);
	const [openAddSpotDialogBox, setOpenAddSpotDialogBox] = useState(false);
	const [searchAddress, setSearchAddress] = useState("");
	const [suggestions, setSuggestions] = useState(false);
	const [predictions, setPredictions] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [startTime, setStartTime] = useState(null);
	const [myLocationstatus, setStatus] = useState(""); // status: '', 'loading', 'success', 'error'
	const [mtLocationMessage, setMessage] = useState("");
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [isAddressValid, setIsAddressValid] = useState(false);
	const [myCurrentLocation, setMyCurrentLocation] = useState("");
	const hasFetchedLocation = useRef(false);
	const [recentSearches, setRecentSearches] = useState(() => {
		const saved = localStorage.getItem("recentSearches");
		return saved ? JSON.parse(saved) : [];
	});
	const autocompleteServiceRef = useRef(null);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	/**
	 * Calculates the initial start time rounded to the nearest 30 minutes
	 *
	 * @returns {Date } Rounded start time
	 *
	 */
	const getInitialStartTime = () => {
		const now = new Date();
		const roundedMinutes = now.getMinutes() <= 30 ? 30 : 60;
		return setMinutes(addMinutes(now, roundedMinutes - (now.getMinutes() % 30)), 0);
	};

	// Show snackbar when location status changes
	useEffect(() => {
		if (myLocationstatus) setOpenSnackbar(true);
	}, [myLocationstatus]);

	// Initialize Google Maps services
	useEffect(() => {
		if (isLoaded && window.google && !autocompleteServiceRef.current) {
			try {
				autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
				// Set initial time
				const intitalTime = getInitialStartTime();
				setStartTime(intitalTime);
			} catch (error) {
				console.error("Error initializing AutocompleteService:", error);
			}
		}
	}, [isLoaded]);

	// Initialize current location
	useEffect(() => {
		if (isLoaded && window.google && !hasFetchedLocation.current) {
			hasFetchedLocation.current = true;

			const storedLocation = localStorage.getItem("userLocation");
			if (storedLocation) {
				const parsed = JSON.parse(storedLocation);
				setMyCurrentLocation(parsed.address);
				setNewMarker({ name: parsed.address, location: { lat: parsed.lat, lng: parsed.lng } });
				return;
			}

			setStatus("loading");
			setMessage("Detecting location...");

			if (!navigator.geolocation) {
				setStatus("error");
				setMessage("Geolocation not supported.");
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const { latitude, longitude } = pos.coords;
					const geocoder = new window.google.maps.Geocoder();
					geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
						if (status === "OK" && results[0]) {
							const location = results[0].geometry.location;
							const currentLocationAddress = results[0].formatted_address;

							setStatus("success");
							setMessage("Location found!");
							setIsAddressValid(true);
							setMyCurrentLocation(currentLocationAddress);

							const newSearchMarker = {
								name: currentLocationAddress,
								location: { lat: location.lat(), lng: location.lng() },
							};

							setNewMarker(newSearchMarker);

							// Save to localStorage
							localStorage.setItem(
								"userLocation",
								JSON.stringify({
									address: currentLocationAddress,
									lat: location.lat(),
									lng: location.lng(),
								})
							);
						} else {
							setStatus("error");
							setMessage("Unable to find address.");
						}
					});
				},
				(err) => {
					console.error("Location error:", err);
					setStatus("error");
					setMessage("Unable to detect location.");
				},
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
			);
		}
	}, [isLoaded, setNewMarker]);

	/**
	 * Updates the recent search history with a new search item
	 *
	 * @param {string} newSearch - the new searched address to  add
	 * @returns
	 */
	const updateRecentSearches = (newSearch) => {
		if (!searchAddress) return;
		setRecentSearches((prev) => {
			const updated = [newSearch, ...prev.filter((item) => item !== newSearch)].slice(0, 4);
			localStorage.setItem("recentSearches", JSON.stringify(updated));
			return updated;
		});
	};

	/**
	 * Handles input changes in the seach bar with debouncing
	 *
	 * @param {object} event  -Input change event
	 * @returns
	 */
	const handleSearchChange = (event) => {
		const value = event.target.value;
		setSearchAddress(value);

		if (!value) {
			setPredictions([]);
			setSuggestions(false);
			return;
		}

		if (!autocompleteServiceRef.current) {
			console.error("Autocomplete service not initialized yet");
			return;
		}

		// Add console log to check if this function is being called
		//console.log("Fetching predictions for:", value);

		// Clear previous timeout to implement debouncing
		if (window.searchTimeout) {
			clearTimeout(window.searchTimeout);
			clearTimeout(window.searchTimeout);
		}

		// Debounce the predictions request
		window.searchTimeout = setTimeout(() => {
			autocompleteServiceRef.current.getPlacePredictions(
				{
					input: value,
					componentRestrictions: { country: "IN" },
				},
				(results, status) => {
					if (status === "OK" && results) {
						setPredictions(results);
						setSuggestions(true);
					} else {
						setPredictions([]);
						setSuggestions(true);
					}
				}
			);
		}, 300);
	};

	/**
	 * Handles selection of location suggestion
	 *
	 * @param {string} description - the seleted address description
	 */
	const handleSuggestionClick = (description) => {
		setSearchAddress(description);
		setIsAddressValid(true);
		setSuggestions(false);
		setPredictions([]);

		// Get location coordinates
		if (isLoaded && window.google) {
			const geocoder = new window.google.maps.Geocoder();
			geocoder.geocode({ address: description }, (results, status) => {
				if (status === "OK" && results[0]) {
					const location = results[0].geometry.location;
					const newSearchMarker = {
						name: description,
						location: { lat: location.lat(), lng: location.lng() },
					};
					setNewMarker(newSearchMarker);
					setSelectedMarker(newSearchMarker);
				}
			});
		}
	};

	/**
	 * Clears the search input and resets related states
	 */
	const handleClearSearch = () => {
		setSearchAddress("");
		setIsAddressValid(false);
		setSuggestions(false);
		setPredictions([]);
	};

	/**
	 *
	 * Gets the user current location using geolocation
	 */
	const handleUseMyLocation = () => {
		setStatus("loading");
		setMessage("Detecting location...");

		if (!navigator.geolocation) {
			setStatus("error");
			setMessage("Geolocation not supported.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				if (isLoaded && window.google) {
					const geocoder = new window.google.maps.Geocoder();
					geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
						if (status === "OK" && results[0]) {
							setStatus("success");
							setMessage("Location found!");
							setIsAddressValid(true);
							const location = results[0].geometry.location;
							const currentLocationAddress = results[0].formatted_address;
							const newSearchMarker = {
								name: currentLocationAddress,
								location: { lat: location.lat(), lng: location.lng() },
							};

							setSearchAddress(currentLocationAddress);
							setNewMarker(newSearchMarker);
							setSelectedMarker(newSearchMarker);
							setSuggestions(false);
						} else {
							setStatus("error");
							setMessage("Unable to find address.");
						}
					});
				}
			},
			(err) => {
				console.error("Location error:", err);
				setStatus("error");
				setMessage("Unable to detect location.");
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	};
	/**
	 * Handles the find parking button click and nivgates to the map search screen
	 *
	 */
	const handleFindParkingClick = () => {
		if (!isAddressValid) {
			alert("Please enter a valid location to search for parking spots.");
			return;
		}
		if (!searchAddress || searchAddress.trim() === "") {
			alert("Please enter a location to search for parking spots.");
			return;
		}
		updateRecentSearches(searchAddress);
		console.log("Selected Date:", selectedDate.toDateString());
		const weekDay = selectedDate.toLocaleDateString("en-US", { weekday: "short" });
		setFilters((prev) => ({ ...prev, available_days: [weekDay] }));

		if (startTime) {
			const formattedStartTime = `${startTime?.getHours() || 0}:${startTime?.getMinutes().toString().padStart(2, "0")}`;
			setFilters((prev) => ({ ...prev, open_time: formattedStartTime }));
		}

		navigate("/mapsearch", {
			state: {
				locationName: searchAddress,
				selectedDate,
				startTime,
			},
		});
	};

	// Error and loading states
	if (loadError) {
		return <ErrorMessage message={loadError} />;
	}
	if (!isLoaded) {
		return <LoadingMessage />;
	}

	/**
	 * Common action buttons used in both mobile and desktop views
	 *
	 * @component
	 * @returns {JSX.Element} Action buttons for finding parking and adding spots
	 */
	const ActionButtons = () => (
		<>
			<Button
				fullWidth
				variant="contained"
				onClick={handleFindParkingClick}
				disabled={!searchAddress || searchAddress.trim() === ""}
				sx={{
					borderRadius: isMobile ? 2 : 1,
					py: 1.5,
					mb: 1,
					backgroundImage: "linear-gradient(to right, #1976d2, #2196f3)",
				}}
			>
				Find Parking Spots
			</Button>

			<Divider sx={{ my: isMobile ? 2 : 4 }}>
				<Typography variant="body2" color="text.secondary">
					Or
				</Typography>
			</Divider>

			<Button
				sx={{
					position: "relative",
					borderRadius: isMobile ? 2 : 1,
					py: isMobile ? 1.5 : 1.25,
				}}
				onClick={() => navigate("/addspot")}
				variant="outlined"
				fullWidth
				disableElevation
				startIcon={<IoLocationSharp size={20} />}
			>
				Add Parking Spot
			</Button>
		</>
	);

	return (
		<>
			{/*  Dialog for both views */}
			<Dialog open={openAddSpotDialogBox} onClose={() => setOpenAddSpotDialogBox(false)}>
				<AddSpotUser onCancel={() => setOpenAddSpotDialogBox(false)} />
			</Dialog>

			{/*  SnackBAr for both views */}
			<Snackbar
				open={openSnackbar}
				autoHideDuration={3000}
				onClose={() => setOpenSnackbar(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setOpenSnackbar(false)}
					severity={myLocationstatus === "error" ? "error" : myLocationstatus === "success" ? "success" : "info"}
					sx={{ width: "100%" }}
				>
					{mtLocationMessage}
				</Alert>
			</Snackbar>

			{/* MOBILE VIEW */}
			{isMobile && (
				<Box sx={{ bgcolor: "#fff", py: 4, px: 2 }}>
					{/* Header for mobile */}
					<Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom color="primary.main">
						Smart Parking
					</Typography>
					<Typography variant="subtitle2" textAlign="center" mb={4} color="text.secondary">
						Find & reserve parking spots in seconds
					</Typography>

					{/* Search Section */}
					<Box sx={{ my: 4 }}>
						<SearchBar
							searchAddress={searchAddress}
							handleSearchChange={handleSearchChange}
							handleClearSearch={handleClearSearch}
							handleUseMyLocation={handleUseMyLocation}
							handleSuggestionClick={handleSuggestionClick}
							setSuggestions={setSuggestions}
							predictions={predictions}
							suggestions={suggestions}
							isMobile={isMobile}
							myLocationstatus={myLocationstatus}
							mtLocationMessage={mtLocationMessage}
							recentSearches={recentSearches}
							onSelect={(search) => handleSuggestionClick(search)}
						/>
						<ActionButtons />
					</Box>

					{myCurrentLocation ? (
						<NearByParkings
							isMobile={isMobile}
							origin={myCurrentLocation}
							onSpotSelect={(spot) => {
								setSelectedMarker(spot);
							}}
							selectedDate={selectedDate}
							startTime={startTime}
						/>
					) : (
						<Stack spacing={2} sx={{ maxWidth: "100%" }}>
							{[1, 2, 3].map((item) => (
								<SkeletonCard key={item} />
							))}
						</Stack>
					)}

					{user ? <PastBooking user={user} /> : <BookingSkeleton />}

					{/* How Smart Parking Works Section */}
					<Box sx={{ mt: 5, mb: 3 }}>
						<Typography variant="h6" fontWeight="bold" textAlign="center" mb={3} color="text.primary">
							How Smart Parking Works
						</Typography>

						<Grid container direction="row" spacing={2} justifyContent="center">
							{[
								{
									title: "Look",
									img: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
									desc: "Search and compare prices at thousands of parking facilities across India.",
								},
								{
									title: "Book",
									img: "https://cdn-icons-png.flaticon.com/512/2089/2089678.png",
									desc: "Pay securely and receive a receipt instantly via email.",
								},
								{
									title: "Park",
									img: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
									desc: "When you arrive, follow the instructions in email receipt, park, and go!",
								},
							].map((item) => (
								<Grid item xs={4} textAlign="center" key={item.title}>
									<Box
										component="img"
										src={item.img}
										alt={item.title}
										sx={{ width: 40, height: 40, mb: 1 }}
									/>
									<Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
										{item.title}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{item.desc}
									</Typography>
								</Grid>
							))}
						</Grid>
					</Box>
				</Box>
			)}

			{/* DESKTOP VIEW */}
			{!isMobile && (
				<Box sx={{ bgcolor: "#fff", p: 8 }}>
					<Grid container spacing={5} alignItems="flex-start">
						<Grid item md={6}>
							<Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
								Parking made easy,
								<br /> wherever you go
							</Typography>

							{/* Search Field */}
							<SearchBar
								searchAddress={searchAddress}
								handleSearchChange={handleSearchChange}
								handleClearSearch={handleClearSearch}
								handleUseMyLocation={handleUseMyLocation}
								handleSuggestionClick={handleSuggestionClick}
								setSuggestions={setSuggestions}
								predictions={predictions}
								suggestions={suggestions}
								isMobile={isMobile}
								mtLocationMessage={mtLocationMessage}
								myLocationstatus={myLocationstatus}
								recentSearches={recentSearches}
								onSelect={(search) => handleSuggestionClick(search)}
							/>

							<ActionButtons />

							{user ? <PastBooking user={user} isMobile={isMobile} /> : <BookingSkeleton />}
						</Grid>

						{/* Right Side - Nearby Parkings */}
						<Grid item md={6}>
							{myCurrentLocation ? (
								<NearByParkings
									isMobile={isMobile}
									origin={myCurrentLocation}
									onSpotSelect={(spot) => {
										setSelectedMarker(spot);
									}}
								/>
							) : (
								<Stack spacing={2} sx={{ maxWidth: "100%" }}>
									{[1, 2, 3].map((item) => (
										<SkeletonCard key={item} />
									))}
								</Stack>
							)}
						</Grid>
					</Grid>

					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Box
							component="img"
							src={parking}
							alt="Parking"
							sx={{
								width: "50%",
								borderRadius: 4,
								objectFit: "cover",
							}}
						/>
					</Box>

					{/* How it works */}
					<Box sx={{ bgcolor: "#fff", py: 10 }}>
						<Typography variant="h5" fontWeight="bold" textAlign="center" mb={6} color="text.primary">
							How Smart Parking Works
						</Typography>
						<Grid container spacing={6} justifyContent="center">
							{[
								{
									title: "Look",
									img: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
									desc: "Search and compare prices at thousands of parking facilities across India.",
								},
								{
									title: "Book",
									img: "https://cdn-icons-png.flaticon.com/512/2089/2089678.png",
									desc: "Pay securely and receive a receipt instantly via email.",
								},
								{
									title: "Park",
									img: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
									desc: "When you arrive, follow the instructions in email receipt, park, and go!",
								},
							].map((item) => (
								<Grid item xs={12} md={4} textAlign="center" key={item.title}>
									<Box
										component="img"
										src={item.img}
										alt={item.title}
										sx={{ width: 80, height: 80, mb: 2 }}
									/>
									<Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
										{item.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{item.desc}
									</Typography>
								</Grid>
							))}
						</Grid>
					</Box>
				</Box>
			)}
		</>
	);
};

export default HomePage;
