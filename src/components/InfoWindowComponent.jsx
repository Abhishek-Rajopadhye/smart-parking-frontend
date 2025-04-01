
import { InfoWindow } from '@react-google-maps/api';
import { Box, Typography, IconButton } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import { Link, useNavigate } from 'react-router-dom';

const InfoWindowComponent = ({ selectedMarker, newMarker, setSelectedMarker, calculateDistance }) => {
    const navigate = useNavigate();

    const position = {
        lat: selectedMarker.location?.lat || selectedMarker.latitude,
        lng: selectedMarker.location?.lng || selectedMarker.longitude
    };

    const isExistingMarker = selectedMarker && newMarker &&
        (selectedMarker.name !== newMarker.name ||
            selectedMarker.spot_id !== newMarker.spot_id);

    const showDetails = () => {
        if (selectedMarker) {
            console.log("Before navigating  ", selectedMarker)  // Ensure selectedMarker is not null
            navigate("/spotdetail");
        } else {
            console.error("No marker selected to navigate!");
        }
    }

    return (

        <Box>
            <InfoWindow
                position={position}
                onCloseClick={() => setSelectedMarker(null)}
            >
                <Box
                    sx={{
                        bgcolor: "#ffffff", // White background
                        color: "#333", // Dark text for contrast
                        padding: 2,
                        minWidth: 260,
                    }}>

                    <Box sx={{ display: 'flex', alignItems: "center", justifyContent: "space-between", padding: 1, mb: 2 }}>
                        <Typography variant='h6' fontWeight="bold" color='primary' >
                            {selectedMarker?.spot_title || "Destination"}
                        </Typography>
                        {isExistingMarker && (<IconButton
                            size="small"
                            component={Link}
                            to="/spotdetail"
                            onClick={showDetails}
                            sx={{ marginRight: 1 }}>
                            <InfoIcon color="primary" />
                        </IconButton>)}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1, maxWidth: 260 }}>
                        <LocationOnIcon sx={{ mr: 1, color: "red" }} />
                        <Typography variant='body2'> {selectedMarker.address || selectedMarker.name}</Typography>
                    </Box>

                    {isExistingMarker && (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <CurrencyRupeeIcon sx={{ mr: 1, color: "green" }} />
                                <Typography variant='body2'>  {selectedMarker.hourly_rate} (1 Hr )</Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <AccessTimeFilledIcon sx={{ mr: 1, color: "#ff9800" }} />
                                <Typography variant='body2'>  {selectedMarker.hourly_rate} (1 Hr )</Typography>
                                <Typography > {selectedMarker.open_time} to {selectedMarker.close_time}</Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center" }} >
                                <DirectionsWalkIcon sx={{ mr: 1, color: "#007bff" }} />
                                <Typography variant="h6" fontWeight="bold" >
                                    ({calculateDistance(newMarker.location || newMarker, { lat: position.lat, lng: position.lng })} km )
                                </Typography>

                            </Box>
                        </>
                    )}
                </Box>
            </InfoWindow>
        </Box>
    );
};

export { InfoWindowComponent };
