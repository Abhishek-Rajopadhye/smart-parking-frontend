import React from "react";
import {
	Box,
	TextField,
	InputAdornment,
	IconButton,
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Skeleton,
	Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { MyLocationOutlined } from "@mui/icons-material";
import RecentSearchesSection from "./RecentSearchSection";

/**
 *
 * SearchBar  Component
 *
 * A customized search bar component that displays locatin search functionality,
 * including auto-suggestions ,recent searches, and current locatin detection.
 *
 * @param {Object} props - Component props
 * @param {string} props.searchAddress - Current search text input value from homepage
 * @param {Function} props.handleSearchChange - Handler for search input changes
 * @param {Function} props.handleClearSearch - Handler to clear search input
 * @param {Function} props.handleUseMyLocation - Handler for using current location
 * @param {Function} props.handleSuggestionClick - Handler for suggestion click
 * @param {Function} props.setSuggestions - Function to control suggestion visibility
 * @param {Array} props.predictions - location predictions/suggestions based on search input
 * @param {boolean} props.suggestions - Whether to show suggestions dropdown
 * @param {boolean} props.isMobile - Whether the component is rendered on mobile view
 * @param {string} props.myLocationstatus - Status of getting user location ('idle', 'loading', 'success', 'error')
 * @param {Array} props.recentSearches - List of recent location searches
 * @param {Function} props.onSelect - Handler for when a recent search is selected
 * @returns {React.ReactElement} The SearchBar component
 */
const SearchBar = ({
	searchAddress,
	handleSearchChange,
	handleClearSearch,
	handleUseMyLocation,
	handleSuggestionClick,
	setSuggestions,
	predictions,
	suggestions,
	isMobile,
	myLocationstatus,
	recentSearches,
	onSelect,
}) => {
	// Display recent searches only when there no active search and we have search history
	const shouldShowRecentSearches = suggestions && !searchAddress && recentSearches.length > 0;

	return (
		<Box sx={{ position: "relative", width: "100%", mb: 2, mt: isMobile ? 5 : 0 }}>
			{/*Search Input */}
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
					placeholder="Search for a location"
					value={searchAddress}
					onChange={handleSearchChange}
					onFocus={() => setSuggestions(true)}
					onBlur={() => setTimeout(() => setSuggestions(false), 150)} // Delay to allow click
					InputProps={{
						startAdornment: (
							<InputAdornment position="start" sx={{ position: "absolute", left: "10px" }}>
								{myLocationstatus === "loading" ? (
									<Skeleton variant="circular" width={24} height={24} />
								) : (
									<SearchIcon color="action" />
								)}
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
							py: isMobile ? 1.75 : 2,
						},
						"& .MuiOutlinedInput-root": {
							borderRadius: isMobile ? 2 : 1,
						},
					}}
					autoComplete="off"
				/>
			</FormControl>

			{/* Suggestions Dropdown */}
			{suggestions && (
				<Paper
					elevation={3}
					sx={{
						position: "absolute",
						width: "100%",
						zIndex: 1100,
						mt: 0,
						borderRadius: "8px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
						bgcolor: "background.paper",
						overflow: "hidden",
					}}
				>
					{/* Use Current Location Option */}
					<Box
						sx={{
							p: 1.5,
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							"&:hover": { backgroundColor: "action.hover" },
							borderLeft: "4px solid",
							borderColor: "primary.main",
						}}
						onClick={handleUseMyLocation}
					>
						<MyLocationOutlined sx={{ mr: 1.5 }} color="primary" />
						<Typography fontWeight="medium">Use My Current Location</Typography>
					</Box>

					{/* Recent Searches Section */}
					{shouldShowRecentSearches && (
						<RecentSearchesSection onSelect={onSelect} recentSearches={recentSearches} isMobile={isMobile} />
					)}

					{/* Location Predictions Section */}
					{searchAddress && predictions.length > 0
						? predictions.map((prediction, index) => (
								<Box
									key={index}
									onClick={() => handleSuggestionClick(prediction.description)}
									sx={{
										p: 1.5,
										pl: 2,
										cursor: "pointer",
										"&:hover": { backgroundColor: "action.hover" },
										borderBottom: index < predictions.length - 1 ? "1px solid" : "none",
										borderColor: "divider",
									}}
								>
									<Typography variant="body2">{prediction.description}</Typography>
								</Box>
						  ))
						: searchAddress && (
								<Box sx={{ p: 2, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										No locations found. Try a different search term.
									</Typography>
								</Box>
						  )}
				</Paper>
			)}
		</Box>
	);
};

export default SearchBar;