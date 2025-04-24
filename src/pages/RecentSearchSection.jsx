import { Box, Chip, Typography, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { History as HistoryIcon, Search as SearchIcon } from "@mui/icons-material";

// Recent searches section
const RecentSearchesSection = ({ onSelect, isMobile, recentSearches }) => (
	<Box sx={{ mb: 4 }}>
		<Typography
			variant={isMobile ? "subtitle1" : "h6"}
			fontWeight="bold"
			sx={{ mb: 1.5, display: "flex", alignItems: "center" ,color:"gray" }}
		>
			<HistoryIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24  }} color="primary" />
			Recent Searches
		</Typography>
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{recentSearches.map((search, index) => (
				<Chip
					key={index}
					label={search}
					onClick={() => onSelect(search)}
					icon={<SearchIcon fontSize="small" />}
					clickable
					size="medium"
					sx={{
            justifyContent:"flex-start",
						borderRadius: "12px",
            maxWidth:"85vw",
						"&:hover": { bgcolor: "primary.light", color: "primary.contrastText" },
					}}
				/>
			))}
		</Box>
	</Box>
);
export default RecentSearchesSection;
