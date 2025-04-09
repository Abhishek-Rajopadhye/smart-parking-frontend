import { useContext, useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Container } from "@mui/material";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Booking } from "./pages/Booking";
import { BookingHistory } from "./pages/BookingHistory";
import { Home } from "./pages/Home";
import { SearchBar } from "./components/SearchBar2";
import { Auth } from "./pages/Auth";
import { Spot } from "./pages/Spot";
import DetailInfo from "./components/DetailInfo";
import { MapProvider } from "./context/MapContext";
import HomePage from "./pages/HomePage";
import { LoadScript } from "@react-google-maps/api";


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
			result = result.filter((marker) => filters.available_days.every((day) => marker.available_days.includes(day)));
		}
		setFilteredMarkers(result);
	}, [filters, markers]);

	const getPageTitle = () => {
		switch (location.pathname) {
			case "/profile":
				return "Profile";
			case "/booking-history":
				return "Booking History";
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

	const handleAvatarClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const routes = [
		{ label: "Home", path: "/home" },
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
		<Box sx={{ display: "flex",flexDirection:"column", width: "100%" }}>
			<AppBar position="fixed" sx={{ zIndex: 3 }}>
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						{getPageTitle()}
					</Typography>
					{location.pathname === "/home" && (
						<>
							<Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
								<SearchBar
									setNewMarker={setNewMarker}
									setSelectedMarker={setSelectedMarker}
									mapRef={mapRef}
									filters={filters}
									setFilters={setFilters}
								/>
							</Box>
						</>
					)}
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
							}}
							sx={{ color: "red" }}
						>
							Logout
						</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>

			<Box variant="main">
				<Routes>
					<Route path="/spot" element={<Spot />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/booking-history" element={<BookingHistory />} />
					<Route path="/HomePage" element={<HomePage/>}/>

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
					<Route path="/spotdetail/" element={<DetailInfo selectedMarker={selectedMarker}/>} />
					<Route path="*" element={<Navigate to="/home" />} />
				</Routes>
			</Box>
		</Box>
	);
};

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
