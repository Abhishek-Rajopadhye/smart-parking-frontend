import React, { useState, useRef, useEffect, useContext } from "react";
import {
	Box,
	Dialog,
	Grid,
	Typography,
	TextField,
	Button,
	InputAdornment,
	FormControl,
	InputLabel,
	IconButton,
	Paper,
	Popover,
	Divider,
	useTheme,
	useMediaQuery,
	Skeleton,
	Chip,
	Snackbar,
	Alert,
} from "@mui/material";
import {
	Search as SearchIcon,
	CalendarToday as CalendarIcon,
	Clear as ClearIcon,
	KeyboardArrowDown as KeyboardArrowDownIcon,
	History as HistoryIcon,
	TrendingUp as TrendingUpIcon,
	MyLocation,
} from "@mui/icons-material";

import { IoLocationSharp } from "react-icons/io5";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import parking from "../assets/Images/parkingSpace.jpg";
import { useNavigate } from "react-router-dom";
import { MapContext } from "../context/MapContext";
import { Spot } from "./Spot";
import RecentSearchesSection from "./RecentSearchSection";
import SearchBar from "../components/SearchBar";
import { isBefore, addMinutes, setHours, setMinutes } from "date-fns";

// Popular destinations data
const popularDestinations = [
	{ id: 1, name: "City Mall", icon: "🛒", address: "123 Mall Street, City" },
	{ id: 2, name: "Central Station", icon: "🚂", address: "Main Station Road" },
	{ id: 3, name: "City Airport", icon: "✈️", address: "Airport Highway" },
	{ id: 4, name: "Sports Stadium", icon: "🏟️", address: "Stadium Boulevard" },
];

// Loading message component
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

// Error message component
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

// Popular destinations section
const PopularDestinationsSection = ({ onSelect, isMobile }) => (
	<Box sx={{ mb: 4 }}>
		<Typography
			variant={isMobile ? "subtitle1" : "h6"}
			fontWeight="bold"
			sx={{ my: isMobile ? 1 : 3, display: "flex", alignItems: "center", color: "gray" }}
		>
			<TrendingUpIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} color="primary" />
			Popular Destinations
		</Typography>
		<Grid container spacing={isMobile ? 1 : 2}>
			{popularDestinations.map((destination) => (
				<Grid item xs={6} key={destination.id}>
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							p: isMobile ? 1.5 : 2,
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": { transform: "translateY(-2px)", boxShadow: 1 },
							display: "flex",
							alignItems: "center",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
						onClick={() => onSelect(destination.address)}
					>
						<Typography variant="h5" sx={{ mr: 1 }}>
							{destination.icon}
						</Typography>
						<Box>
							<Typography variant="body2" noWrap sx={{ maxWidth: isMobile ? "86%" : "10vw" }}>
								{destination.name}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{destination.address}
							</Typography>
						</Box>
					</Paper>
				</Grid>
			))}
		</Grid>
	</Box>
);

// Main HomePage component
const HomePage = ({ setSelectedMarker, setNewMarker, newMarker, setFilters }) => {
	const { isLoaded, loadError } = useContext(MapContext);
	const [openAddSpotDialogBox, setOpenAddSpotDialogBox] = useState(false);
	const [searchAddress, setSearchAddress] = useState("");
	const [suggestions, setSuggestions] = useState(false);
	const [predictions, setPredictions] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [startTime, setStartTime] = useState(null);
	const [myLocationstatus, setStatus] = useState(""); // status: '', 'loading', 'success', 'error'
	const [mtLocationMessage, setMessage] = useState("");
	const [openSnackbar,setOpenSnackbar]=useState(false);
	const [isAddressValid, setIsAddressValid] = useState(false);

	const [recentSearches, setRecentSearches] = useState(() => {
		const saved = localStorage.getItem("recentSearches");
		return saved ? JSON.parse(saved) : [];
	});

	const autocompleteServiceRef = useRef(null);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const getInitialStartTime = () => {
		const now = new Date();
		const roundedMinutes = now.getMinutes() <= 30 ? 30 : 60;
		return setMinutes(addMinutes(now, roundedMinutes - (now.getMinutes() % 30)), 0);
	};

	useEffect(() => {
		if (myLocationstatus) setOpenSnackbar(true);
	}, [myLocationstatus]);

	// Initialize Google Maps services when loaded
	useEffect(() => {
		if (isLoaded && window.google && !autocompleteServiceRef.current) {
			try {
				autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
				const intitalTime =getInitialStartTime();
				setStartTime(intitalTime);
			} catch (error) {
				console.error("Error initializing AutocompleteService:", error);
			}
		}
	}, [isLoaded]);

	// Search handling
	const updateRecentSearches = (newSearch) => {
		if (!searchAddress) return;
		setRecentSearches((prev) => {
			const updated = [newSearch, ...prev.filter((item) => item !== newSearch)].slice(0, 5);
			localStorage.setItem("recentSearches", JSON.stringify(updated));
			return updated;
		});
	};
	const handleSearchChange = (event) => {
		const value = event.target.value;
		setSearchAddress(value);

		if (!value || !autocompleteServiceRef.current) {
			setPredictions([]);
			setSuggestions(value ? true : false);
			return;
		}

		// Debounce the predictions request
		const timeoutId = setTimeout(() => {
			autocompleteServiceRef.current.getPlacePredictions(
				{ input: value, componentRestrictions: { country: "IN" } },
				(results, status) => {
					if (results && status === "OK") {
						setPredictions(results);
						setSuggestions(true);
					} else {
						setPredictions([]);
						setSuggestions(true);
					}
				}
			);
		}, 300);

		return () => clearTimeout(timeoutId);
	};

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

	const handleClearSearch = () => {
		setSearchAddress("");
		setIsAddressValid(false);
		setSuggestions(false);
		setPredictions([]);
	};

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
						}else{
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

	const handleFindParkingClick = () => {
		if(!isAddressValid){
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
	if (loadError) return <ErrorMessage message={loadError} />;
	if (!isLoaded) return <LoadingMessage />;

	// Shared action buttons
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
			{/* Common Dialog for both views */}
			<Dialog open={openAddSpotDialogBox} onClose={() => setOpenAddSpotDialogBox(false)}>
				<Spot onCancel={() => setOpenAddSpotDialogBox(false)} />
			</Dialog>

			{/* Common SnackBAr for both views */}
			<Snackbar
			open={openSnackbar}
			autoHideDuration={3000}
			onClose={()=>setOpenSnackbar(false)}
			anchorOrigin={{vertical:"top",horizontal:"center"}}
			>
				<Alert
				onClose={()=> setOpenSnackbar(false)}
				severity={
				myLocationstatus === "error" ? "error" : myLocationstatus === "success" ? "success" : "info"
				}
				sx={{width:"100%"}}
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
						/>
						<ActionButtons />
					</Box>

					<Divider sx={{ my: 3 }}>
						<Chip label="Quick Access" />
					</Divider>

					{/* Content for the unused 40% space */}
					<RecentSearchesSection
						onSelect={(search) => handleSuggestionClick(search)}
						isMobile={isMobile}
						recentSearches={recentSearches}
					/>
					<PopularDestinationsSection onSelect={(address) => handleSuggestionClick(address)} isMobile={isMobile} />

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
					<Grid container spacing={5} alignItems="center">
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
							/>

							<ActionButtons />

							<PopularDestinationsSection
								onSelect={(address) => handleSuggestionClick(address)}
								isMobile={isMobile}
							/>
						</Grid>

						{/* Right Image */}
						<Grid item md={5}>
							<Divider sx={{ my: 3 }}>
								<Chip label="Quick Access" />
							</Divider>
							<RecentSearchesSection
								onSelect={(search) => handleSuggestionClick(search)}
								isMobile={isMobile}
								recentSearches={recentSearches}
							/>
							<Box sx={{ display: "flex", justifyContent: "center" }}>
								<Box
									component="img"
									src={parking}
									alt="Parking"
									sx={{
										width: "80%",
										borderRadius: 4,
										objectFit: "cover",
									}}
								/>
							</Box>
						</Grid>
					</Grid>

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
