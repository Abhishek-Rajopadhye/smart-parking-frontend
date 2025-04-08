import { useContext, useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Drawer, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Booking } from "./pages/Booking";
import { BookingHistory } from "./pages/BookingHistory";
import { MySpots } from "./pages/MySpots";
import { Home } from "./pages/Home";
import { SearchBar } from "./components/SearchBar2";
import { Auth } from "./pages/Auth";
import { Spot } from "./pages/Spot";
import { AddReview } from "./components/AddReview";
import DetailInfo from "./components/DetailInfo";
import FilterPanel from "./components/filterPanel";
import { MapProvider } from "./context/MapContext";

/**
 * A Routing Layout for the Application
 * @component
 * @returns {JSX.Element} AppLayout Component
 */
const AppLayout = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [newMarker, setNewMarker] = useState(null);
	const [markers, setMarkers] = useState([]);
	const [filteredMarkers, setFilteredMarkers] = useState([]);
	const [filters, setFilters] = useState({});
	const mapRef = useRef(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const user_id = params.get("user_id");
		if (token) {
			localStorage.setItem("token", String(token));
			localStorage.setItem("user_id", String(user_id));
			navigate("/home");
		}
	}, [navigate]);

	useEffect(() => {
		let result = markers;

		if (filters.hourly_rate) {
			result = result.filter((marker) => marker.hourly_rate <= filters.hourly_rate);
		}

		if (filters.open_time) {
			result = result.filter((marker) => marker.open_time <= filters.open_time && marker.close_time >= filters.open_time);
		}

		if (filters.close_time) {
			result = result.filter(
				(marker) => marker.close_time >= filters.close_time && marker.open_time <= filters.close_time
			);
		}

		if (filters.available_days && filters.available_days.length > 0) {
			result = result.filter((marker) => {
				const spotDays = marker.available_days;
				console.log("Spot days of marker ", spotDays);
				return filters.available_days.every((day) => {
					return spotDays.includes(day);
				});
			});
		}

		setFilteredMarkers(result);
	}, [filters, markers]);

	//Handles the toggle for when the navbar drawer should be shown or not
	const handleDrawerToggle = () => {
		setIsDrawerOpen(!isDrawerOpen);
	};

	//Gets the title of the page to display on the AppBar
	const getPageTitle = () => {
		switch (location.pathname) {
			case "/profile":
				return "Profile";
			case "/booking-history":
				return "Booking History";
			case "/my-spots":
				return "My Spots";
			case "/spot":
				return "Add Spot";
			case "/home":
				return "Home";
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

	if (!user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", width: "100%" }}>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="fixed" sx={{ zIndex: "3" }}>
					<Toolbar>
						<IconButton
							edge="start"
							color="inherit"
							aria-label="menu"
							onClick={handleDrawerToggle}
							sx={{ marginRight: 2 }}
						>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
							{getPageTitle()}
						</Typography>
						{getPageTitle() === "Home" && (
							<Box sx={{ display: "flex", flexShrink: 0 }}>
								<SearchBar setNewMarker={setNewMarker} setSelectedMarker={setSelectedMarker} mapRef={mapRef} />
								<FilterPanel filters={filters} setFilters={setFilters} />
							</Box>
						)}
					</Toolbar>
				</AppBar>
				<Toolbar />
			</Box>
			<Box sx={{ flexGrow: 1 }}>
				<Drawer
					anchor="left"
					open={isDrawerOpen}
					sx={{
						// Help of auto generate for styling was used
						width: 350,
						boxSizing: "border-box",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
						<IconButton onClick={handleDrawerToggle}>
							<ChevronLeftIcon />
						</IconButton>
					</Box>
					<NavBar user={user} logout={logout} />
				</Drawer>
			</Box>
			<Box sx={{ flexGrow: 1, p: 3, top: 15, width: "100vw" }} variant="main">
				<Routes>
					<Route path="/spot" element={<Spot />}></Route>
					<Route path="/profile" element={<Profile />} />
					<Route path="/booking-history" element={<BookingHistory />} />
					<Route path="/my-spots" element={<MySpots />} />
					<Route path="/add-review" element={<AddReview />} />
					<Route
						path="/home"
						element={
							<Home
								selectedMarker={selectedMarker}
								setSelectedMarker={setSelectedMarker}
								newMarker={newMarker}
								setNewMarker={setNewMarker}
								markers={markers}
								setMarkers={setMarkers}
								mapRef={mapRef}
								filteredMarkers={filteredMarkers}
							/>
						}
					/>
					<Route path="/auth" element={<Auth />} />
					<Route path="/booking" element={<Booking spot_information={selectedMarker} user_id={user.id} />} />
					<Route path="/spotdetail" element={<DetailInfo selectedMarker={selectedMarker} user={user} />} />
					<Route path="/spot" element={<Spot />} />
					<Route path="*" element={<Navigate to="/home" />} />
				</Routes>
			</Box>
		</Box>
	);
};

/**
 * Main App component
 * @component
 * @returns {JSX.Element} App Component
 */
const App = () => {
	return (
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
	);
};

export default App;
