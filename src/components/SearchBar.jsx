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
	Snackbar,
	Alert,
	Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { MyLocationOutlined } from "@mui/icons-material";
import RecentSearchesSection from "./RecentSearchSection";

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

	const shouldShowRecentSearches = suggestions && !searchAddress && recentSearches.length > 0;

	return (
		<Box sx={{ position: "relative", width: "100%", mb: 2, mt: isMobile ? 5 : 0 }}>
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
					{shouldShowRecentSearches && <RecentSearchesSection onSelect={onSelect} recentSearches={recentSearches} />}

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
