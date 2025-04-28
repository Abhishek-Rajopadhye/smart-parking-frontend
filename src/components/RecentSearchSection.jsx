import { Box, Chip, Typography, Paper, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { History as HistoryIcon, Search as SearchIcon } from "@mui/icons-material";
import { MyLocationOutlined, HistoryOutlined } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
// Recent searches section
const RecentSearchesSection = ({ onSelect, recentSearches }) => (
	<>
	<Divider />
	<Box sx={{ p: 1.5 }}>
		<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
			<HistoryOutlined sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
			<Typography variant="subtitle2" color="text.secondary">
				Recent Searches
			</Typography>
		</Box>
		<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
			{recentSearches.map((search, index) => (
				<Chip
					key={index}
					label={search}
					onClick={() => onSelect(search)}
					sx={{
						borderRadius: 1,
						"&:hover": { bgcolor: "action.selected" },
					}}
					icon={<LocationOnIcon fontSize="small" />}
				/>
			))}
		</Box>
	</Box>
	<Divider />
</>
);
export default RecentSearchesSection;
