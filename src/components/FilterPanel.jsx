import { useState } from "react";
import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Chip, Button, Box, Typography } from "@mui/material";
import { FilterAlt as FilterAltIcon } from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Slider from "@mui/material/Slider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

const FilterPanel = ({ filters, setFilters }) => {
	const [showFilter, setShowFilter] = useState(false);
	const [parkingPrice, setPrice] = useState(0);
	const [openTime, setOpenTime] = useState(null);
	const [closeTime, setCloseTime] = useState(null);
	const [selectedDays, setSelectedDays] = useState([]);

	const availableDaysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	const handlePrice = (event, value) => {
		setPrice(value);
		setFilters((prev) => ({ ...prev, hourly_rate: value }));
	};

	const handleOpenTime = (newTime) => {
		setOpenTime(newTime);
		if (newTime) {
			setFilters((prev) => ({ ...prev, open_time: newTime.format("HH:mm") }));
		}
	};

	const handleCloseTime = (newTime) => {
		setCloseTime(newTime);
		if (newTime) {
			setFilters((prev) => ({ ...prev, close_time: newTime.format("HH:mm") }));
		}
	};

	const handleSelectDay = (day) => {
		const updateDays = selectedDays.includes(day)
			? selectedDays.filter((d) => d !== day) // Remove if already selected
			: [...selectedDays, day]; // Add if not selected
		setSelectedDays(updateDays);
		setFilters((prev) => ({ ...prev, available_days: updateDays }));
	};
	const handleFilter = () => {
		setShowFilter((prev) => !prev);
	};

	const resetFilter = () => {
		setPrice(0);
		setOpenTime(null);
		setCloseTime(null);
		setSelectedDays([]);
		setFilters({});
	};
	return (
		<>
			<IconButton onClick={handleFilter}>
				<FilterAltIcon />
			</IconButton>

			<Dialog open={showFilter} onClose={handleFilter} sx={{ "& .MuiDialog-paper": { width: 400, borderRadius: 3 } }}>
				<DialogTitle sx={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>Filters</DialogTitle>

				<DialogContent>
					{/* Price Range Slider */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
						<CurrencyRupeeIcon sx={{ color: "green" }} />
						<Typography variant="h6">Price Range</Typography>
					</Box>
					<Box sx={{ width: "90%", px: 2 }}>
						<Slider
							value={parkingPrice}
							onChange={handlePrice}
							aria-label="Default"
							valueLabelDisplay="auto"
							max={1000}
							sx={{ color: "primary.main" }}
						/>
					</Box>

					{/* Open Time Picker */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}>
						<AccessTimeIcon sx={{ color: "blue" }} />
						<Typography variant="h6">Open Time</Typography>
					</Box>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<TimePicker
							label="Open Time"
							value={openTime}
							onChange={handleOpenTime}
							viewRenderers={{
								hours: renderTimeViewClock,
								minutes: renderTimeViewClock,
							}}
							sx={{ width: "100%", mt: 1 }}
						/>
					</LocalizationProvider>

					{/* Close Time Picker */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}>
						<AccessTimeIcon sx={{ color: "red" }} />
						<Typography variant="h6">Close Time</Typography>
					</Box>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<TimePicker
							label="Close Time"
							value={closeTime}
							onChange={handleCloseTime}
							viewRenderers={{
								hours: renderTimeViewClock,
								minutes: renderTimeViewClock,
							}}
							sx={{ width: "100%", mt: 1 }}
						/>
					</LocalizationProvider>

					{/* Days Available */}
					<Box sx={{ mt: 3 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<CalendarTodayIcon sx={{ color: "purple" }} />
							<Typography variant="h6">Available Days</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
							{availableDaysList.map((day) => (
								<Chip
									key={day}
									label={day}
									color={selectedDays.includes(day) ? "primary" : "default"}
									size="small"
									sx={{
										fontWeight: "bold",
										cursor: "pointer",
										border: selectedDays.includes(day) ? "2px solid blue" : "1px solid grey",
									}}
									onClick={() => handleSelectDay(day)}
								/>
							))}
						</Box>
					</Box>
				</DialogContent>

				<DialogActions sx={{ justifyContent: "center", paddingBottom: 2 }}>
					<Button onClick={handleFilter} variant="contained" color="primary" sx={{ width: "40%", borderRadius: 3 }}>
						Apply Filters
					</Button>
					<Button onClick={resetFilter} variant="contained" color="default" sx={{ width: "40%", borderRadius: 3 }}>
						Reset
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export { FilterPanel };
