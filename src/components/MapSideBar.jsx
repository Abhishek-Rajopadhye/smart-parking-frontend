/**
 * @file MapSidebar.jsx
 * @description A sidebar component for map interaction that provides location search, date/time selection,
 * price filtering, and displays parking spot results.
 *
 */

import React, { useState, useContext, useEffect, useRef } from "react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	InputAdornment,
	IconButton,
	Slider,
	FormControl,
	Select,
	MenuItem,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useLocation } from "react-router-dom";
import { Search as SearchIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MapContext } from "../context/MapContext";
import { getLatLng } from "react-places-autocomplete";
import MarkerCard from "./MarkerCard";
import { isBefore, format, isToday } from "date-fns";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import RecentSearchesSection from "./RecentSearchSection";

/**
 * MapSidebar component provides search and filtering capabilities for the parking map
 *
 * * @param {MapSidebarProps} props - Component props
 * @typedef {Object} MapSidebarProps
 * @property {React.RefObject} mapRef - Reference to the Google Map instance
 * @property {Function} setNewMarker - Function to set a new marker on the map
 * @property {Function} setSelectedMarker - Function to set the currently selected marker
 * @property {Array} markers - Array of all available markers/parking spots
 * @property {Function} setFilters - Function to update the filter criteria
 * @property {Array} filteredMarkers - Array of markers that match the current filters
 * @returns {JSX.Element} The rendered sidebar component
 */

// eslint-disable-next-line no-unused-vars
const MapSidebar = ({ mapRef, setNewMarker, setSelectedMarker, markers, setFilters, filteredMarkers }) => {
	const location = useLocation();
	const { isLoaded, loadError } = useContext(MapContext);

	// State for search and location
	const [searchLocation, setSearchLocation] = useState("");
	const [tempLocation, setTempLocation] = useState("");
	const [latlng, setLatLng] = useState(null);
	const [suggestions, setSuggestions] = useState(false);
	const [predictions, setPredictions] = useState([]);
	const autocompleteServiceRef = useRef(null);

	// State for date and time selection
	const [tempDate, setTempDate] = useState(new Date());
	const [tempStartTime, setTempStartTime] = useState(null);
	const [tempEndTime, setTempEndTime] = useState(null);
	const [availableStartTimes, setAvailableStartTimes] = useState([]);
	const [availableEndTimes, setAvailableEndTimes] = useState([]);

	// State for price range
	const [parkingPrice, setParkingPrice] = useState([0, 250]);

	// State for recent searches
	const [recentSearches, setRecentSearches] = useState(() => {
		const saved = localStorage.getItem("recentSearches");
		return saved ? JSON.parse(saved) : [];
	});

	const showRecentSearches = suggestions && !tempLocation && recentSearches.length > 0;

	/**
	 * Adds a search term to recent searches and updates localStorage
	 *
	 * @param {string} newSearch - Search address to add to recent searches
	 */
	const updateRecentSearches = (newSearch) => {
		setRecentSearches((prev) => {
			const updated = [newSearch, ...prev.filter((item) => item !== newSearch)].slice(0, 4);
			localStorage.setItem("recentSearches", JSON.stringify(updated));
			return updated;
		});
	};

	/**
	 * Initialize Google Places AutocompleteService and handle location state
	 */
	useEffect(() => {
		if (isLoaded && window.google && !autocompleteServiceRef.current) {
			autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
		}

		if (location?.state) {
			const { locationName, startTime, endTime, selectedDate } = location.state;
			setSearchLocation(locationName);
			setTempLocation(locationName);
			setTempStartTime(startTime);
			setTempEndTime(endTime);
			setTempDate(selectedDate);
		}
	}, [isLoaded, location]);

	/**
	 * Generates available time slots in 30-minute intervals
	 *
	 * @param {Date} date - The selected date
	 * @param {boolean} isStartTime - Whether generating slots for start time (true) or end time (false)
	 * @param {Date|null} referenceTime - Reference time (used for end time generation)
	 * @returns {Array} Array of time slot objects with label and value properties
	 */
	const generateTimeSlots = (date, isStartTime = true, referenceTime = null) => {
		if (!date) return [];

		const slots = [];
		const today = new Date();
		const isDateToday = isToday(date);

		let startHour = 0;
		let startMinute = 0;

		// If it's today and we're generating start times, begin from the current time (rounded up)
		if (isDateToday && isStartTime) {
			const currentHour = today.getHours();
			const currentMinute = today.getMinutes();

			// Round up to nearest 30 minutes
			if (currentMinute <= 30) {
				startHour = currentHour;
				startMinute = 30;
			} else {
				startHour = currentHour + 1;
				startMinute = 0;
			}
		}

		// If it's for end times and we have a reference time (start time)
		if (!isStartTime && referenceTime) {
			startHour = referenceTime.getHours();
			startMinute = referenceTime.getMinutes();

			// Move to next slot for minimum end time
			if (startMinute === 0) {
				startMinute = 30;
			} else {
				startHour += 1;
				startMinute = 0;
			}
		}

		// Generate slots from the determined start time until midnight
		for (let hour = startHour; hour < 24; hour++) {
			for (let minute = hour === startHour ? startMinute : 0; minute < 60; minute += 30) {
				const timeSlot = new Date(date);
				timeSlot.setHours(hour, minute, 0, 0);

				const formattedTime = format(timeSlot, "h:mm a");
				slots.push({
					label: formattedTime,
					value: timeSlot,
				});
			}
		}

		return slots;
	};

	/**
	 * Update time slots when the selected date changes
	 */
	useEffect(() => {
		if (!tempDate) return;

		// Generate start time slots
		const startTimeSlots = generateTimeSlots(tempDate, true);
		setAvailableStartTimes(startTimeSlots);

		// If we have no current start time but have slots available, set a default
		if (startTimeSlots.length > 0 && !tempStartTime) {
			const defaultStart = startTimeSlots[0].value;
			setTempStartTime(defaultStart);

			// Generate end time slots based on this default start time
			const endTimeSlots = generateTimeSlots(tempDate, false, defaultStart);
			setAvailableEndTimes(endTimeSlots);

			// Set default end time
			if (endTimeSlots.length > 0) {
				setTempEndTime(endTimeSlots[0].value);
			}
		} else if (tempStartTime) {
			// If we already have a start time, update end time options
			const endTimeSlots = generateTimeSlots(tempDate, false, tempStartTime);
			setAvailableEndTimes(endTimeSlots);

			// Reset end time if it's no longer valid
			const endTimeIsValid = endTimeSlots.some(
				(slot) =>
					slot.value.getHours() === tempEndTime?.getHours() && slot.value.getMinutes() === tempEndTime?.getMinutes()
			);

			if (!endTimeIsValid && endTimeSlots.length > 0) {
				setTempEndTime(endTimeSlots[0].value);
			}
		}
	}, [tempDate, tempEndTime, tempStartTime]);

	/**
	 * Handles start time selection and updates end time options accordingly
	 *
	 * @param {Date} newStartTime - The newly selected start time
	 */
	const handleStartTimeChange = (newStartTime) => {
		if (!newStartTime) return;

		setTempStartTime(newStartTime);

		// Immediately regenerate end time options based on the new start time
		const endTimeSlots = generateTimeSlots(tempDate, false, newStartTime);
		setAvailableEndTimes(endTimeSlots);

		// Reset end time if it's before the start time or if there's no current end time
		const currentEndTimeValid = tempEndTime && isBefore(newStartTime, tempEndTime);

		if (!currentEndTimeValid && endTimeSlots.length > 0) {
			setTempEndTime(endTimeSlots[0].value);
		}
	};

	/**
	 * Update end times whenever start time changes
	 */
	useEffect(() => {
		if (!tempStartTime || !tempDate) return;

		const endTimeSlots = generateTimeSlots(tempDate, false, tempStartTime);
		setAvailableEndTimes(endTimeSlots);

		// Check if current end time is still valid
		if (tempEndTime) {
			const endTimeValid = endTimeSlots.some(
				(slot) =>
					slot.value.getHours() === tempEndTime.getHours() && slot.value.getMinutes() === tempEndTime.getMinutes()
			);

			// If not valid, set to first available slot
			if (!endTimeValid && endTimeSlots.length > 0) {
				setTempEndTime(endTimeSlots[0].value);
			}
		} else if (endTimeSlots.length > 0) {
			// If no end time is set, set default
			setTempEndTime(endTimeSlots[0].value);
		}
	}, [tempStartTime, tempDate, tempEndTime]);

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
		setNewMarker(null);
	};

	
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (!hasInitializedRef.current && tempLocation && tempStartTime && tempEndTime && tempDate) {
			handleUpdateSearch();
			hasInitializedRef.current = true;
		}
	}, [tempLocation, tempStartTime, tempEndTime, tempDate]);
	
	

	/**
	 * Updates the search filters and triggers a map update.
	 */
	const handleUpdateSearch = () => {
		setSearchLocation(tempLocation);
		updateRecentSearches(tempLocation);

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

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Paper elevation={3} sx={{ p: 2, height: "100vh", borderRadius: 0, overflowY: "auto" }}>
				{/* Location Search Section */}
				<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
					Book Parking Near
				</Typography>
				<TextField
					fullWidth
					placeholder="Search location"
					value={tempLocation}
					onChange={handleSearchChange}
					onFocus={() => setSuggestions(true)}
					onBlur={() => setTimeout(() => setSuggestions(false), 150)} // Delay to allow click
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

				{/* Suggestions Dropdown */}
				{suggestions && (
					<Paper>
						{showRecentSearches && (
							<RecentSearchesSection
								recentSearches={recentSearches}
								onSelect={(search) => handleSuggestionClick(search)}
							/>
						)}
						{tempLocation && predictions.length > 0
							? predictions.map((prediction, index) => (
									<Box
										key={index}
										onClick={() => handleSuggestionClick(prediction.description)}
										sx={{ p: 1.5, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
									>
										<Typography variant="body2">{prediction.description}</Typography>
									</Box>
							  ))
							: tempLocation && (
									<Box sx={{ p: 2, textAlign: "center" }}>
										<Typography variant="body2" color="text.secondary">
											No locations found. Try a different search term.
										</Typography>
									</Box>
							  )}
					</Paper>
				)}

				{/* Date Picker Section */}
				<DatePicker
					value={tempDate}
					onChange={(newDate) => {
						setTempDate(newDate);
						// Reset time selections when date changes
						setTempStartTime(null);
						setTempEndTime(null);
					}}
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
					sx={{ mt: 2 }}
				/>

				{/* Start Time Section */}
				<Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
					Enter After
				</Typography>
				<FormControl fullWidth>
					<Select
						value={tempStartTime || ""}
						onChange={(e) => handleStartTimeChange(e.target.value)}
						displayEmpty
						renderValue={(selected) => {
							if (!selected) return <Typography color="text.secondary">Select start time</Typography>;
							return format(selected, "h:mm a");
						}}
						startAdornment={
							<InputAdornment position="start">
								<AccessTimeIcon fontSize="small" />
							</InputAdornment>
						}
					>
						{availableStartTimes.map((slot, index) => (
							<MenuItem key={`start-${index}`} value={slot.value}>
								{slot.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{/* End Time Section */}
				<Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
					Exit Before
				</Typography>
				<FormControl fullWidth>
					<Select
						value={tempEndTime || ""}
						onChange={(e) => setTempEndTime(e.target.value)}
						displayEmpty
						disabled={!tempStartTime}
						renderValue={(selected) => {
							if (!selected) return <Typography color="text.secondary">Select end time</Typography>;
							return format(selected, "h:mm a");
						}}
						startAdornment={
							<InputAdornment position="start">
								<AccessTimeIcon fontSize="small" />
							</InputAdornment>
						}
					>
						{availableEndTimes.map((slot, index) => (
							<MenuItem key={`end-${index}`} value={slot.value}>
								{slot.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{/* Price Range Section */}
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
				{/* Search Button */}
				<Button
					variant="contained"
					fullWidth
					onClick={handleUpdateSearch}
					sx={{ mt: 3 }}
					disabled={!tempLocation || !tempDate || !tempStartTime || !tempEndTime}
				>
					Update Search
				</Button>
				{/* Result Cards Section */}
				<Box sx={{ mt: 3 }}>
					<MarkerCard markers={filteredMarkers} origin={searchLocation} latlng={latlng} />
				</Box>
			</Paper>
		</LocalizationProvider>
	);
};

export default MapSidebar;
