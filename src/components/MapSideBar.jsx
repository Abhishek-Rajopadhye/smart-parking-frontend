/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Slider } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useLocation, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MapContext } from "../context/MapContext";
import { getLatLng } from "react-places-autocomplete";
import MarkerCard from "./MarkerCard";
import { isBefore, addMinutes, setHours, setMinutes } from "date-fns";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const MapSidebar = ({ mapRef, setNewMarker, setSelectedMarker, markers, setFilters, filteredMarkers }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchLocation, setSearchLocation] = useState("");
	const [latlng, setLatLng] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [suggestions, setSuggestions] = useState(false);
	const { isLoaded, loadError } = useContext(MapContext);
	const [predictions, setPredictions] = useState([]);
	const autocompleteServiceRef = useRef(null);
	const [tempLocation, setTempLocation] = useState("");
	const [tempDate, setTempDate] = useState(new Date());
	const [tempStartTime, setTempStartTime] = useState(null);
	const [tempEndTime, setTempEndTime] = useState(null);
	const [parkingPrice, setParkingPrice] = useState([0, 250]);

	useEffect(() => {
		if (isLoaded && window.google && !autocompleteServiceRef.current) {
			autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
		}

		if (location?.state) {
			const { locationName, startTime, endTime, selectedDate } = location.state;
			setSearchLocation(locationName);
			setTempLocation(locationName);
			setStartTime(startTime);
			setTempStartTime(startTime);
			setEndTime(endTime);
			setTempEndTime(endTime);
			setSelectedDate(selectedDate);
			setTempDate(selectedDate);
		}
	}, [isLoaded, location]);

	if (loadError) return <div>Error loading Google Maps</div>;
	if (!isLoaded) return <div>Loading Google Maps...</div>;

	/**
	 * Handles changes to the parking price slider.
	 *
	 * @param {Object} event - The slider change event.
	 * @param {Array} value - The updated price range.
	 */
	const handlePrice = (event, value) => {
		setParkingPrice(value);
	};

	/**
	 * Handles changes to the search input field.
	 *
	 * Updates the autocomplete suggestions based on the input value.
	 *
	 * @param {Object} event - The input change event.
	 */
	const handleSearchChange = (event) => {
		const value = event.target.value;
		setTempLocation(value);

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

	/**
	 * Handles the selection of an autocomplete suggestion.
	 *
	 * @param {string} description - The selected location description.
	 */
	const handleSuggestionClick = (description) => {
		setTempLocation(description);
		setSuggestions(false);
		setPredictions([]);
	};

	/**
	 * Clears the search input field and resets suggestions.
	 */
	const handleClearSearch = () => {
		setTempLocation("");
		setSuggestions(false);
		setPredictions([]);
	};

	/**
	 * Updates the search filters and triggers a map update.
	 */
	const handleUpdateSearch = () => {
		setSearchLocation(tempLocation);
		setSelectedDate(tempDate);
		setStartTime(tempStartTime);
		setEndTime(tempEndTime);

		const weekDay = tempDate.toLocaleDateString("en-US", { weekday: "short" });

		if (tempDate) {
			setFilters((prev) => ({ ...prev, available_days: [weekDay] }));
		}
		if (tempStartTime) {
			setFilters((prev) => ({
				...prev,
				open_time: `${tempStartTime?.getHours()}:${tempStartTime?.getMinutes().toString().padStart(2, "0")}`,
			}));
		}
		if (tempEndTime) {
			setFilters((prev) => ({
				...prev,
				close_time: `${tempEndTime?.getHours()}:${tempEndTime?.getMinutes().toString().padStart(2, "0")}`,
			}));
		}
		if (parkingPrice) {
			setFilters((prev) => ({ ...prev, hourly_rate: parkingPrice }));
		}

		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ address: tempLocation }, async (results, status) => {
			if (status === "OK" && results[0]) {
				const latLng = await getLatLng(results[0]);
				setLatLng(latLng);

				const newSearchMarker = { name: tempLocation, location: latLng };
				setNewMarker(newSearchMarker);
				setSelectedMarker(newSearchMarker);

				if (mapRef.current) {
					mapRef.current.panTo(latLng);
					mapRef.current.setZoom(14);
				}
			}
		});
	};

	/**
	 * Calculates the initial start time based on the selected date.
	 *
	 * @param {Date} date - The selected date.
	 * @returns {Date} The rounded start time.
	 */
	const getInitialStartTime = (date) => {
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();
		if (!isToday) return setHours(setMinutes(new Date(date), 0), 0);

		const minutes = now.getMinutes();
		const remainder = 30 - (minutes % 30);
		const roundedTime = addMinutes(now, remainder);
		roundedTime.setSeconds(0);
		roundedTime.setMilliseconds(0);

		return roundedTime;
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Paper elevation={3} sx={{ p: 2, height: "100vh", borderRadius: 0, overflowY: "auto" }}>
				{/* Search Location */}
				<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
					Book Parking Near
				</Typography>
				<TextField
					fullWidth
					placeholder="Search location"
					value={tempLocation}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
						),
						endAdornment: tempLocation && (
							<InputAdornment position="end">
								<IconButton size="small" onClick={handleClearSearch}>
									<ClearIcon />
								</IconButton>
							</InputAdornment>
						),
					}}
					autoComplete="off"
				/>
				{/* Suggestions */}
				{suggestions && predictions.length > 0 && (
					<Paper sx={{ position: "absolute", zIndex: 1100, mt: 0.5 }}>
						{predictions.map((prediction, index) => (
							<Box
								key={index}
								onClick={() => handleSuggestionClick(prediction.description)}
								sx={{ p: 1.5, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
							>
								<Typography variant="body2">{prediction.description}</Typography>
							</Box>
						))}
					</Paper>
				)}
				{/* Date Picker */}
				<DatePicker
					value={tempDate}
					onChange={setTempDate}
					disablePast
					slotProps={{
						textField: {
							fullWidth: true,
							InputProps: {
								endAdornment: (
									<InputAdornment position="end">
										<CalendarTodayIcon fontSize="small" />
									</InputAdornment>
								),
							},
						},
					}}
				/>
				{/* Time Pickers */}
				<Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
					Enter After
				</Typography>
				<TimePicker
					value={tempStartTime}
					onChange={setTempStartTime}
					ampm
					minutesStep={30}
					slotProps={{
						textField: {
							fullWidth: true,
							InputProps: {
								endAdornment: (
									<InputAdornment position="end">
										<AccessTimeIcon fontSize="small" />
									</InputAdornment>
								),
							},
						},
					}}
				/>
				<Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
					Exit Before
				</Typography>
				<TimePicker
					value={tempEndTime}
					onChange={setTempEndTime}
					ampm
					minutesStep={30}
					slotProps={{
						textField: {
							fullWidth: true,
							InputProps: {
								endAdornment: (
									<InputAdornment position="end">
										<AccessTimeIcon fontSize="small" />
									</InputAdornment>
								),
							},
						},
					}}
				/>
				{/* Price Range */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}>
					<CurrencyRupeeIcon sx={{ color: "green" }} />
					<Typography variant="h6">Price Range</Typography>
				</Box>
				<Slider
					value={parkingPrice}
					onChange={handlePrice}
					aria-label="Price Range"
					valueLabelDisplay="auto"
					max={500}
					sx={{ color: "primary.main" }}
				/>
				{/* Update Search */}
				<Button variant="contained" fullWidth onClick={handleUpdateSearch} sx={{ mt: 3 }}>
					Update Search
				</Button>
				{/* Marker Cards */}
				<Box sx={{ mt: 3 }}>
					<MarkerCard markers={filteredMarkers} origin={searchLocation} latlng={latlng} />
				</Box>
			</Paper>
		</LocalizationProvider>
	);
};

export default MapSidebar;
