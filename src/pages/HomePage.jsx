/* eslint-disable no-unused-vars */
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
} from "@mui/material";
import {
	Search as SearchIcon,
	CalendarToday as CalendarIcon,
	Clear as ClearIcon,
	KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import DateTimePicker from "../components/DateTimePicker";
import { IoLocationSharp } from "react-icons/io5";
import parking from "../assets/Images/parkingSpace.jpg";
import { useNavigate } from "react-router-dom";
import { MapContext } from "../context/MapContext";
import { Spot } from "./Spot";

const HomePage = () => {
	const { isLoaded, loadError } = useContext(MapContext);
	const [openAddSpotDialogBox, setOpenAddSpotDialogBox] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [searchAddress, setSearchAddress] = useState("");
	const [suggestions, setSuggestions] = useState(false);
	const [predictions, setPredictions] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const autocompleteServiceRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoaded && window.google && !autocompleteServiceRef.current) {
			autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
		}
	}, [isLoaded]);

	if (loadError) return <div>Error loading Google Maps</div>;
	if (!isLoaded) return <div>Loading Google Maps...</div>;

	const handleSearchChange = (event) => {
		const value = event.target.value;
		setSearchAddress(value);

		if (!value || !autocompleteServiceRef.current) {
			setPredictions([]);
			setSuggestions(false);
			return;
		}

		autocompleteServiceRef.current.getPlacePredictions(
			{ input: value, componentRestrictions: { country: "IN" } },
			(results) => {
				if (results) {
					setPredictions(results);
					setSuggestions(true);
				} else {
					setPredictions([]);
					setSuggestions(false);
				}
			}
		);
	};

	const handleSuggestionClick = (description) => {
		setSearchAddress(description);
		setSuggestions(false);
		setPredictions([]);
		// Optional: Get lat lng using Geocoder
		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ address: description }, (results, status) => {
			if (status === "OK" && results[0]) {
				const location = results[0].geometry.location;
				console.log("Lat:", location.lat(), "Lng:", location.lng());
			}
		});
	};

	const handleClearSearch = () => {
		setSearchAddress("");
		setSuggestions(false);
		setPredictions([]);
	};

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const handleDateTimeClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleDateTimeClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? "date-time-popover" : undefined;

	return (
		<Box sx={{ bgcolor: "#fff", p: 8 }}>
			<Grid container spacing={4} alignItems="center">
				<Grid item xs={12} md={6}>
					<Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
						Parking made easy,
						<br /> wherever you go
					</Typography>

					{/* <Box sx={{ mb: 2, mt: 4 }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 'medium',
                                        fontSize: '1rem',
                                    }
                                }}
                            >
                                <Tab label="Hourly/Daily" />
                                <Tab label="Monthly" />
                            </Tabs>
                        </Box> */}

					{/* Search Field */}
					<Box sx={{ position: "relative", width: "100%", my: 2 }}>
						<FormControl fullWidth variant="outlined">
							<InputLabel
								shrink
								sx={{
									backgroundColor: "white",
									px: 0.5,
									transform: "translate(14px, -9px) scale(0.75)",
									transformOrigin: "top left",
								}}
							>
								Where are you going?
							</InputLabel>

							<TextField
								fullWidth
								placeholder=" "
								value={searchAddress}
								onChange={handleSearchChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start" sx={{ position: "absolute", left: "10px" }}>
											<SearchIcon color="action" />
										</InputAdornment>
									),
									endAdornment: searchAddress && (
										<InputAdornment position="end">
											<IconButton size="small" onClick={handleClearSearch}>
												<ClearIcon />
											</IconButton>
										</InputAdornment>
									),
									sx: { pl: 4 },
								}}
								sx={{
									"& .MuiOutlinedInput-input": {
										py: 2,
									},
								}}
								autoComplete="off"
							/>
						</FormControl>

						{suggestions && predictions.length > 0 && (
							<Paper
								sx={{
									position: "absolute",
									width: "100%",
									zIndex: 1100,
									mt: 0.5,
									borderRadius: "4px",
									boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
									bgcolor: "background.paper",
								}}
							>
								{predictions.map((prediction, index) => (
									<Box
										key={index}
										onClick={() => handleSuggestionClick(prediction.description)}
										sx={{
											p: 1.5,
											cursor: "pointer",
											"&:hover": { backgroundColor: "#f5f5f5" },
										}}
									>
										<Typography variant="body2">{prediction.description}</Typography>
									</Box>
								))}

								<Box
									sx={{
										borderTop: "1px solid rgba(0,0,0,0.1)",
										p: 1,
										display: "flex",
										justifyContent: "center",
									}}
								>
									<Box
										component="img"
										src="/api/placeholder/144/18"
										alt="Powered by Google"
										sx={{ height: "18px" }}
									/>
								</Box>
							</Paper>
						)}
					</Box>

					{/* Date Time Picker */}
					<Box sx={{ position: "relative", width: "100%", my: 2 }}>
						<FormControl fullWidth variant="outlined">
							<InputLabel
								shrink
								sx={{
									backgroundColor: "white",
									px: 0.5,
									transform: "translate(14px, -9px) scale(0.75)",
									transformOrigin: "top left",
								}}
							>
								When do you need to park?
							</InputLabel>

							<Box sx={{ position: "relative" }} color="white">
								<Box
									sx={{
										position: "absolute",
										left: "10px",
										top: "50%",
										transform: "translateY(-50%)",
										zIndex: 1,
									}}
								>
									<CalendarIcon color="action" />
								</Box>

								<Button
									fullWidth
									aria-describedby={id}
									onClick={handleDateTimeClick}
									sx={{
										justifyContent: "flex-start",
										borderRadius: "4px",
										border: "1px solid rgba(0, 0, 0, 0.23)",
										py: 2,
										pl: 5,
										textTransform: "none",
										backgroundColor: "white",
										color: "rgba(0, 0, 0, 0.87)",
										fontWeight: 400,
										fontSize: "1rem",
										textAlign: "left",
										"&:hover": {
											backgroundColor: "rgba(0, 0, 0, 0.04)",
											border: "1px solid rgba(0, 0, 0, 0.23)",
										},
									}}
								>
									{selectedDate ? selectedDate.toDateString() : "Select date & time"}
								</Button>

								<Box
									sx={{
										position: "absolute",
										right: "10px",
										top: "50%",
										transform: "translateY(-50%)",
									}}
								>
									<KeyboardArrowDownIcon color="action" />
								</Box>
							</Box>
						</FormControl>

						<Popover
							id={id}
							open={open}
							anchorEl={anchorEl}
							onClose={handleDateTimeClose}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
						>
							<Box className="date-time-picker">
								<DateTimePicker
									suggestions={suggestions}
									setSuggestions={setSuggestions}
									handleSearchChange={handleSearchChange}
									selectedDate={selectedDate}
									setSelectedDate={setSelectedDate}
									startTime={startTime}
									setStartTime={setStartTime}
									endTime={endTime}
									setEndTime={setEndTime}
									onClose={handleDateTimeClose}
								/>
							</Box>
						</Popover>
					</Box>

					<Button
						fullWidth
						variant="contained"
						onClick={() => {
							navigate("/mapsearch", {
								state: {
									locationName: searchAddress,
									selectedDate,
									startTime,
									endTime,
								},
							});
						}}
						sx={{
							borderRadius: 1,
							py: 1.5,
						}}
					>
						Find Parking Spots
					</Button>
					<Divider sx={{ my: 4 }} >
						<Typography variant="body2" color="text.secondary">
							Or	
						</Typography>
					</Divider>
					{/* Button to add new parking spot */}
					<Button
						sx={{ position: "relative" }}
						onClick={() => setOpenAddSpotDialogBox(true)}
						variant="contained"
						fullWidth
						disableElevation
						startIcon={<IoLocationSharp size={20} />}
					>
						Add Parking Spot
					</Button>
				</Grid>

				{/* Right Image */}
				<Grid item xs={12} md={6}>
					<Box
						component="img"
						src={parking}
						alt="Parking"
						sx={{
							width: "100%",
							borderRadius: 4,
							objectFit: "cover",
						}}
					/>
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
							<Box component="img" src={item.img} alt={item.title} sx={{ width: 80, height: 80, mb: 2 }} />
							<Typography variant="h6" fontWeight="bold" gutterBottom>
								{item.title}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{item.desc}
							</Typography>
						</Grid>
					))}
				</Grid>
			</Box>
			<Dialog open={openAddSpotDialogBox} onClose={() => setOpenAddSpotDialogBox(false)}>
				<Spot
					onCancel={() => {
						setOpenAddSpotDialogBox(false);
					}}
				/>
			</Dialog>
		</Box>
	);
};

export default HomePage;
