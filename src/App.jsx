import { useContext, useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Button } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import HomeIcon from "@mui/icons-material/Home";
import { ThemeProvider } from "@mui/material/styles";
import appTheme from "./style/AppTheme";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Booking } from "./pages/Booking";
import { BookingHistory } from "./pages/BookingHistory";
import { Auth } from "./pages/Auth";
import { Spot } from "./pages/Spot";
import DetailInfo from "./components/DetailInfo";
import { MapProvider } from "./context/MapContext";
import HomePage from "./pages/HomePage";
import MapSearch from "./pages/MapSearch";

/**
 * AppLayout component for rendering the main layout of the application.
 *
 * Handles routing, navigation, and global state management for the authenticated user.
 *
 * @component
 * @returns {JSX.Element} The AppLayout component.
 */
const AppLayout = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [newMarker, setNewMarker] = useState(null);
	const [markers, setMarkers] = useState([]);
	const [filteredMarkers, setFilteredMarkers] = useState([]);
	const [filters, setFilters] = useState({});
	const mapRef = useRef(null);

	/**
	 * Handles token and user ID extraction from the URL and stores them in localStorage.
	 *
	 * Redirects the user to the homepage if a token is found.
	 */
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const user_id = params.get("user_id");
		if (token) {
			localStorage.setItem("token", String(token));
			localStorage.setItem("user_id", String(user_id));
			navigate("/homepage");
		}
	}, [navigate]);

	/**
	 * Filters the markers based on the applied filters.
	 *
	 * Updates the `filteredMarkers` state with the filtered results.
	 */
	useEffect(() => {
		// Filter markers based on the parsed times
		let result = markers;

		if (filters.available_days && filters.available_days.length > 0) {
			result = result.filter((marker) => filters.available_days.every((day) => marker.available_days.includes(day)));
		}

		if (filters.hourly_rate) {
			result = result.filter(
				(marker) => marker.hourly_rate >= filters.hourly_rate[0] && marker.hourly_rate <= filters.hourly_rate[1]
			);
		}
		// Function to parse time string to minutes since midnight
		function parseTime(timeStr) {
			const [hours, minutes] = timeStr.split(":").map(Number);
			return hours * 60 + minutes;
		}

		// Function to parse time string with AM/PM to minutes since midnight
		function parseTimeWithAMPM(timeStr) {
			const [time, meridiem] = timeStr.split(" ");
			const [hours, minutes] = time.split(":").map(Number);
			if (meridiem === "PM" && hours !== 12) {
				return (hours + 12) * 60 + minutes;
			} else if (meridiem === "AM" && hours === 12) {
				return 0 * 60 + minutes;
			}
			return hours * 60 + minutes;
		}

		if (filters.open_time) {
			const filterOpenTimeMinutes = parseTime(filters.open_time); // Convert filters to minutes since midnight
			result = result.filter((marker) => {
				const markerOpenTimeMinutes = parseTimeWithAMPM(marker.open_time);
				const markerCloseTimeMinutes = parseTimeWithAMPM(marker.close_time);
				return markerOpenTimeMinutes <= filterOpenTimeMinutes && markerCloseTimeMinutes >= filterOpenTimeMinutes;
			});
		}

		if (filters.close_time) {
			const filterCloseTimeMinutes = parseTime(filters.close_time); // Convert filters to minutes since midnight
			result = result.filter((marker) => {
				const markerOpenTimeMinutes = parseTimeWithAMPM(marker.open_time);
				const markerCloseTimeMinutes = parseTimeWithAMPM(marker.close_time);
				return markerCloseTimeMinutes >= filterCloseTimeMinutes && markerOpenTimeMinutes <= filterCloseTimeMinutes;
			});
		}
		if (filters.hourly_rate) {
			result = result.filter(
				(marker) => marker.hourly_rate >= filters.hourly_rate[0] && marker.hourly_rate <= filters.hourly_rate[1]
			);
		}

		setFilteredMarkers(result);
	}, [filters, markers]);
	 console.log("Filters and markers", filters, filteredMarkers);

	/**
	 * Retrieves the page title based on the current route.
	 *
	 * @returns {string} The title of the current page.
	 */
	const getPageTitle = () => {
		switch (location.pathname) {
			case "/profile":
				return "Profile";
			case "/booking-history":
				return "My Bookings";
			case "/spot":
				return "Add Spot";
			case "/homepage":
				return "Home";
			case "/mapsearch":
				return "Map View";
			case "/auth":
				return "Auth";
			case "/booking":
				return "Booking";
			case "/spotdetail":
				return "Detailed Info";
			default:
				return "App";
		}
	};

	/**
	 * Handles the avatar click to open the user menu.
	 *
	 * @param {Object} event - The click event.
	 */
	const handleAvatarClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	/**
	 * Closes the user menu.
	 */
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const routes = [
		{ label: "Home", path: "/homepage" },
		{ label: "Profile", path: "/profile" },
		{ label: "My Bookings", path: "/booking-history" },
	];

	if (!user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box className="outermost-container" sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
			<AppBar position="fixed" sx={{ zIndex: 3, bgcolor: "#3f51b5", color: "white" }}>
				<Toolbar>
					{location.pathname !== "/homepage" && location.pathname !== "/auth" && (
						<>
							<Button
								variant="Text"
								color="primary"
								startIcon={<KeyboardBackspaceIcon />}
								onClick={() => navigate(-1)}
							/>
							<Button
								variant="Text"
								color="primary"
								startIcon={<HomeIcon />}
								onClick={() => navigate("/homepage")}
							/>
						</>
					)}
					<Typography variant="h6" sx={{ flexGrow: 1, justifyContent: "center", textAlign: "center" }}>
						{getPageTitle()}
					</Typography>
					<IconButton onClick={handleAvatarClick}>
						<Avatar alt="User Avatar" src={user.profile_picture || ""} />
					</IconButton>
					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
						{routes.map((route) => (
							<MenuItem
								key={route.path}
								onClick={() => {
									handleMenuClose();
									navigate(route.path);
								}}
								selected={route.path === location.pathname}
							>
								{route.label}
							</MenuItem>
						))}
						<MenuItem
							onClick={() => {
								handleMenuClose();
								logout();
								navigate("/");
							}}
							sx={{ color: "red" }}
						>
							Logout
						</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>

			<Box variant="main" sx={{ flex: 1, mt: 8 }}>
				<Routes>
					<Route path="/spot" element={<Spot />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/booking-history" element={<BookingHistory />} />
					<Route
						path="/homepage"
						element={
							<HomePage
								setSelectedMarker={setSelectedMarker}
								setNewMarker={setNewMarker}
								newMarker={newMarker}
								setFilters={setFilters}
							/>
						}
					/>

					<Route path="/auth" element={<Auth />} />
					<Route path="/booking" element={<Booking spot_information={selectedMarker} user_id={user.id} />} />
					<Route path="/spotdetail/" element={<DetailInfo selectedMarker={selectedMarker} />} />
					<Route path="/auth" element={<Auth />} />
					<Route path="/booking" element={<Booking spot_information={selectedMarker} user_id={user.id} />} />
					<Route
						path="/mapsearch"
						element={
							<MapSearch
								selectedMarker={selectedMarker}
								setSelectedMarker={setSelectedMarker}
								newMarker={newMarker}
								setNewMarker={setNewMarker}
								markers={markers}
								setMarkers={setMarkers}
								mapRef={mapRef}
								filteredMarkers={filteredMarkers}
								setFilters={setFilters}
							/>
						}
					/>
					<Route path="/spotdetail/:spot_id" element={<DetailInfo />} />
					<Route path="*" element={<Navigate to="/homepage" />} />
				</Routes>
			</Box>
		</Box>
	);
};

/**
 * App component for initializing the application.
 *
 * Wraps the application with providers for authentication, theming, and map context.
 *
 * @component
 * @returns {JSX.Element} The App component.
 */
const App = () => {
	return (
		<ThemeProvider theme={appTheme}>
			<MapProvider>
				<AuthProvider>
					<Router>
						<Routes>
							<Route path="/" element={<Login />} />
							<Route path="/*" element={<AppLayout />} />
						</Routes>
					</Router>
				</AuthProvider>
			</MapProvider>
		</ThemeProvider>
	);
};

export default App;
