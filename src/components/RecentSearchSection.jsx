<<<<<<< HEAD
/**
 * Recent Searches Section Component
 *
 * This component displays a list of the user's recent location searches as clickable chips.
 * It's typically used within search suggestion dropdowns to allow users to quickly
 * access their search history.
 */

import { Box, Chip, Typography, Divider } from "@mui/material";
import { HistoryOutlined } from "@mui/icons-material";
=======
import { Box, Chip, Typography, Paper, Divider } from "@mui/material";
import { History as HistoryIcon, Search as SearchIcon } from "@mui/icons-material";
import { MyLocationOutlined, HistoryOutlined } from "@mui/icons-material";
>>>>>>> b43ab8af247811bdef1a4797a4afe5cdcab8dced
import LocationOnIcon from "@mui/icons-material/LocationOn";

/**
 * RecentSearchesSection Component
 *
 * Displays the user recent  searches as interactive chips
 * with location icons.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Callback function triggered when a search item is selected
 * @param {Array<string>} props.recentSearches - Array of recent search strings
 * @param {boolean} props.isMobile - Whether the component is being rendered on a mobile device
 * @returns {JSX.element} The RecentSearchesSection component
 */
const RecentSearchesSection = ({ onSelect, recentSearches, isMobile }) => (
	<>
		<Divider />
		<Box sx={{ p: 1.5 }}>
<<<<<<< HEAD
			{/* Header */}
=======
>>>>>>> b43ab8af247811bdef1a4797a4afe5cdcab8dced
			<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
				<HistoryOutlined sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
				<Typography variant="subtitle2" color="text.secondary">
					Recent Searches
				</Typography>
			</Box>
<<<<<<< HEAD
			{/* Search chips */}
=======
>>>>>>> b43ab8af247811bdef1a4797a4afe5cdcab8dced
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
