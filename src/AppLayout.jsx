import { useContext, useEffect, useState, useRef } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Button } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import HomeIcon from "@mui/icons-material/Home";
import { AuthContext } from "./context/AuthContext";
import { Profile } from "./pages/Profile";
import { Booking } from "./pages/Booking";
import { Auth } from "./pages/Auth";
import { AddSpotUser } from "./pages/AddSpotUser";
import DetailInfo from "./pages/DetailInfo";
import HomePage from "./pages/HomePage";
import MapSearch from "./pages/MapSearch";
import Validation from "./pages/Validation";
import OwnerDashboard from "./pages/OwnerDashboard";
import { AddSpotOwner } from "./pages/AddSpotOwner";

/**
 * AppLayout component that provides the main application layout, navigation bar, and route management.
 *
 * @component
 * @returns {JSX.Element} The AppLayout component.
 *
 * Handles authentication context, navigation, and conditional rendering of routes and navigation elements
 * based on user type (e.g., Owner or regular user). Displays the top AppBar with navigation buttons,
 * user avatar, and menu. Renders the appropriate page content based on the current route.
 */
const AppLayout = () => {
	const authContextValue = useContext(AuthContext);
	const { user, logout } = authContextValue;
	const navigate = useNavigate();
	const location = useLocation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [newMarker, setNewMarker] = useState(null);
	const [markers, setMarkers] = useState([]);
	const [filteredMarkers, setFilteredMarkers] = useState([]);
	const [filters, setFilters] = useState({});
	const mapRef = useRef(null);

	// NEW: Get sessionType from sessionStorage
	const sessionType = sessionStorage.getItem("sessionType");

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

	useEffect(() => {
		let result = markers;

		if (filters.available_days && filters.available_days.length > 0) {
			result = result.filter((marker) => {
				const daysStr = marker.available_days[0]; // get the first string
				const availableDaysArray = daysStr.split(",").map((d) => d.trim()); // now ['Mon', 'Tue', 'Wed', 'Thu']
				return filters.available_days.every((day) => availableDaysArray.includes(day));
			});
		}

		if (filters.hourly_rate) {
			result = result.filter(
				(marker) => marker.hourly_rate >= filters.hourly_rate[0] && marker.hourly_rate <= filters.hourly_rate[1]
			);
		}

		function parseTime(timeStr) {
			const [hours, minutes] = timeStr.split(":").map(Number);
			return hours * 60 + minutes;
		}
		function parseTimeWithAMPM(timeStr) {
			const time = timeStr.split(" ")[0];
			const [hours, minutes] = time.split(":").map(Number);

			// const [time, meridiem] = timeStr.split(" ");
			// const [hours, minutes] = time.split(":").map(Number);

			return hours * 60 + minutes;
		}

		if (filters.open_time) {
			const filterOpenTimeMinutes = parseTime(filters.open_time);
			result = result.filter((marker) => {
				const markerOpenTimeMinutes = parseTimeWithAMPM(marker.open_time);
				const markerCloseTimeMinutes = parseTimeWithAMPM(marker.close_time);
				return markerOpenTimeMinutes <= filterOpenTimeMinutes && markerCloseTimeMinutes >= filterOpenTimeMinutes;
			});
		}

		if (filters.close_time) {
			const filterCloseTimeMinutes = parseTime(filters.close_time);
			result = result.filter((marker) => {
				const markerOpenTimeMinutes = parseTimeWithAMPM(marker.open_time);
				const markerCloseTimeMinutes = parseTimeWithAMPM(marker.close_time);
				return markerCloseTimeMinutes >= filterCloseTimeMinutes && markerOpenTimeMinutes <= filterCloseTimeMinutes;
			});
		}

		setFilteredMarkers(result);
	}, [filters, markers]);

	const getPageTitle = () => {
		switch (location.pathname) {
			case "/account-details":
				return "Account Details";
			case "/addspotuser":
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
			case "/validation":
				return "Verify Spot Requests";
			case "/ownerdashboard":
				return "Owner Dashboard";
			default:
				return "App";
		}
	};

	const handleAvatarClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const routes = [
		{ label: "Home", path: "/homepage" },
		{ label: "Account Details", path: "/account-details" },
	];

	if (!user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	// --- OWNER DASHBOARD CONDITION ---
	if (sessionType === "Owner") {
		return (
			<Box className="outermost-container" sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
				<AppBar position="fixed" sx={{ zIndex: 3, bgcolor: "#3f51b5", color: "white" }}>
					<Toolbar>
						{location.pathname !== "/ownerdashboard" ? (
							<Button
								variant="Text"
								color="primary"
								startIcon={<KeyboardBackspaceIcon />}
								onClick={() => navigate(-1)}
							/>
						) : (
							<Box sx={{ width: 48, display: "inline-block" }} />
						)}
						<Typography variant="h6" sx={{ flexGrow: 1, justifyContent: "center", textAlign: "center" }}>
							{getPageTitle()}
						</Typography>
						<IconButton onClick={handleAvatarClick}>
							<Avatar alt="Avatar" src={user.profile_picture || ""} />
						</IconButton>
						<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
							<MenuItem
								key={"/ownerdashboard"}
								onClick={() => {
									handleMenuClose();
									navigate("/ownerdashboard");
								}}
								selected={"/ownerdashboard" === location.pathname}
							>
								Owner Dashboard
							</MenuItem>
							{user.email == "abhishek.rajopadhye21@gmail.com" ||
							user.email == "arjunghule6583@gmail.com" ||
							user.email == "saad.ahmed+101@bluepineapple.io" ||
							user.email == "ahm33.saad@gmail.com" ||
							user.email == "saadah0143@gmail.com" ||
							user.email == "kalepradeep2001@gmail.com" ? (
								<MenuItem
									key={"/validation"}
									onClick={() => {
										handleMenuClose();
										navigate("/validation");
									}}
									selected={"/validation" === location.pathname}
								>
									Verify Spot Requests
								</MenuItem>
							) : null}
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
				<Box variant="main" sx={{ flex: 1, mt: 6, width: "100vw" }}>
					<Routes>
						<Route path="/ownerdashboard" element={<OwnerDashboard />} />
						<Route path="/validation" element={<Validation />} />
						<Route path="/addspotowner" element={<AddSpotOwner />} />
						<Route path="*" element={<Navigate to="/ownerdashboard" />} />
					</Routes>
				</Box>
			</Box>
		);
	}
	// --- END OWNER DASHBOARD CONDITION ---

	return (
		<Box className="outermost-container" sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
			<AppBar position="fixed" sx={{ zIndex: 3, bgcolor: "#3f51b5", color: "white" }}>
				<Toolbar>
					{location.pathname !== "/homepage" && location.pathname !== "/auth" && (
						<>
							{location.pathname !== "/mapsearch" ? (
								<Button
									variant="Text"
									color="primary"
									startIcon={<KeyboardBackspaceIcon />}
									onClick={() => navigate(-1)}
								/>
							) : (
								<Box sx={{ width: 48, display: "inline-block" }} /> // Placeholder for spacing
							)}
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
						<Avatar alt="Avatar" src={user.profile_picture || ""} />
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

			<Box variant="main" sx={{ flex: 1, mt: 6, width: "100vw" }}>
				<Routes>
					<Route path="/account-details" element={<Profile />} />
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
					<Route path="/spotdetail/" element={<DetailInfo selectedMarker={selectedMarker} />} />
					<Route path="/auth" element={<Auth />} />
					<Route path="/booking" element={<Booking spot_information={selectedMarker} user_id={user.id} />} />
					<Route path="/addspotuser" element={<AddSpotUser />} />
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

export default AppLayout;
