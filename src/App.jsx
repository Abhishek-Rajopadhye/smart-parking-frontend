import { useContext, useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Button } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
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

const AppLayout = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [newMarker, setNewMarker] = useState(null);
	const [markers, setMarkers] = useState([]);
	const [filteredMarkers, setFilteredMarkers] = useState([]);
	// eslint-disable-next-line no-unused-vars
	const [filters, setFilters] = useState({});
	const mapRef = useRef(null);

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
			
		
		// Filter markers based on the parsed times
let result = markers;

		if (filters.available_days && filters.available_days.length > 0) {
			result = result.filter((marker) => filters.available_days.every((day) => marker.available_days.includes(day)));
		}

// Function to parse time string to minutes since midnight
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to parse time string with AM/PM to minutes since midnight
function parseTimeWithAMPM(timeStr) {
    const [time, meridiem] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) {
        return (hours + 12) * 60 + minutes;
    } else if (meridiem === 'AM' && hours === 12) {
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


		setFilteredMarkers(result);
	}, [filters, markers]);
	console.log("Filters and markers",filters,filteredMarkers);

	const getPageTitle = () => {
		switch (location.pathname) {
			case "/profile":
				return "Profile";
			case "/booking-history":
				return "Booking History";
			case "/spot":
				return "Add Spot";
			case "/homepage":
				return "Home";
			case "/map-screen":
				return "Map Screen";
			case "/auth":
				return "Auth";
			case "/booking":
				return "Booking";
			case "/spotdetail":
				return "Detailed Info";

			default:
				return "Home";
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
		{ label: "Profile", path: "/profile" },
		{ label: "Booking History", path: "/booking-history" },
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
			<AppBar position="fixed" sx={{ zIndex: 3 , bgcolor:"#3f51b5",color:"white"}}>
				<Toolbar>
					{location.pathname !== "/homepage" && location.pathname !== "/auth" && (
						<Button
							variant="Text"
							color="primary"
							startIcon={<KeyboardBackspaceIcon />}
							onClick={() => navigate(-1)}
						>
							Back
						</Button>
					)}
					<Typography variant="h6" sx={{ flexGrow: 1, justifyContent: "center", textAlign: "center" }}>
						{getPageTitle()}
					</Typography>
					<IconButton onClick={handleAvatarClick}>
						<Avatar alt="User Avatar" src={user?.avatarUrl || ""} />
					</IconButton>
					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
						{routes
							.filter((r) => r.path !== location.pathname)
							.map((r) => (
								<MenuItem
									key={r.path}
									onClick={() => {
										handleMenuClose();
										navigate(r.path);
									}}
								>
									{r.label}
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
					<Route path="/homepage" element={<HomePage setSelectedMarker={setSelectedMarker} setNewMarker={setNewMarker} newMarker={newMarker} setFilters={setFilters}/>} />

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
