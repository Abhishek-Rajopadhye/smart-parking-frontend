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
import DetailInfo from "./components/DetailInfo";

/**
 * A Routing Layout for the Application
 * @component
 * @returns {JSX.Element} AppLayout Component
 */
const AppLayout = () => {

	 const spot = {
        owner_id: 101,
        spot_id: 3,
        hourly_rate: 20,
        spot_title: "Green Park Charging Spot",
        address: "A convenient EV charging station located in the heart of the city with fast chargers.",
        open_time: "08:00 am",
        close_time: "20:00 pm",
        available_days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        latitude: 51.5074,
        longitude: 0.1278,
        no_of_slots: 5,
        available_slots: 50,
        description: "This is a convenient EV charging station located in the heart of the city with fast chargers. The station is open from 08:00 AM to 20:00 PM from Tuesday to Sunday. The hourly rate is $50. There are 5 charging slots available, out of which 3 are currently available. The station is located at Green Park, London.",
    };
	const providerId = "111919577987638512190";

	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [newMarker, setNewMarker] = useState(null);
	const [markers, setMarkers] = useState([]);
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
				return "Add Spot"
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
			<AppBar position="fixed">
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
						<Box sx={{ flexShrink: 0 }}>
							<SearchBar setNewMarker={setNewMarker} setSelectedMarker={setSelectedMarker} mapRef={mapRef} />
						</Box>
					)}
				</Toolbar>
			</AppBar>
			<Drawer
				variant="persistent"
				anchor="left"
				open={isDrawerOpen}
				sx={{
					// Help of auto generate for styling was used
					width: 350,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: 350,
						boxSizing: "border-box",
					},
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
					<IconButton onClick={handleDrawerToggle}>
						<ChevronLeftIcon />
					</IconButton>
				</Box>
				<NavBar user={user} logout={logout} />
			</Drawer>
			<Box sx={{ position: "fixed", flexGrow: 1, p: 3, top: 15, left: 150, width: "100%" }} variant="main">
				<Routes>
					<Route path="/spot" element={<Spot userId={providerId}></Spot>}></Route>
					<Route path="/profile" element={<Profile />} />
					<Route path="/booking-history" element={<BookingHistory />} />
					<Route path="/my-spots" element={<MySpots />} />
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
							/>
						}
					/>
					<Route path="/auth" element={<Auth />} />
					<Route path="/booking" element={<Booking spot_information={spot} user_id={user.id} />} />
					<Route path="/spotdetail" element={<DetailInfo selectedMarker={selectedMarker} user={user}/>}/>
					<Route path="/spot" element={<Spot/>}/>
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
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/*" element={<AppLayout />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
