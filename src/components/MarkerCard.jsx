/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import {
	Box,
	Typography,
	Button,
	Select,
	MenuItem,
	Card,
	CardMedia,
	CardContent,
	CardActions,
	FormControl,
	InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MarkerCard = ({ markers, origin ,latlng}) => {
    const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [sortType, setSortType] = useState("price");
   const navigate = useNavigate();
  console.log("Origin",origin)
  console.log("ON the marker card ",markers);
  // Calculate walking time & distance

  const toggleDialogBooking = () => {
		setDialogBookingOpen(!dialogBookingOpen);
	};

  useEffect(() => {
    if (!window.google || !origin || markers.length === 0) return;
  
    const service = new window.google.maps.DistanceMatrixService();
    const destinations = markers.map((marker) => ({
      lat: marker.latitude,
      lng: marker.longitude,
    }));
  
    console.log("Destinations:", destinations);
  
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations,
        travelMode: window.google.maps.TravelMode.WALKING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === "OK" && response?.rows?.length > 0) {
          console.log("Distance Matrix Response:", response);
  
          const updated = markers.map((marker, index) => {
            const element = response.rows[0]?.elements?.[index];
  
            return {
              ...marker,
              walkingDistance: element?.distance?.text || "N/A",
              walkingDuration: element?.duration?.text || "N/A",
              rawDistance: element?.distance?.value || Infinity,
            };
          });
  
          setSortedMarkers(sortMarkers(updated, sortType));
        } else {
          console.error("Distance Matrix failed:", status, response);
        }
      }
    );
  }, [markers, origin]);
  


// const calculateDistance = (origin, destination) => {
//     try {
//         if (!window.google?.maps?.geometry) return null;

//         if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
//             throw new Error("Invalid coordinates provided for distance calculation");
//         }

//         const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);

//         const destinationLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

//         // Distance in meters
//         const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
//             originLatLng,
//             destinationLatLng
//         );

//         // Converting  km with 2 decimal places
//         return (distanceInMeters / 1000).toFixed(2);
//     } catch (error) {
//         console.error("Distance claculation error:", error);
//         return null;
//     }
// };

  const sortMarkers = (markerList, type) => {
    if (type === "price") {
      return [...markerList].sort((a, b) => a.hourly_rate - b.hourly_rate);
    } else if (type === "distance") {
      return [...markerList].sort((a, b) => a.rawDistance - b.rawDistance);
    }
    return markerList;
  };

  const handleSortChange = (event) => {
    const newType = event.target.value;
    setSortType(newType);
    setSortedMarkers(sortMarkers(sortedMarkers, newType));
  };

  return (
    <Box sx={{ maxHeight: "100vh" ,p: 2, bgcolor: "#f9f9f9" }}>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Sort by</InputLabel>
        <Select value={sortType} label="Sort by" onChange={handleSortChange}>
          <MenuItem value="price">Price</MenuItem>
          <MenuItem value="distance">Distance</MenuItem>
        </Select>
      </FormControl>

      {sortedMarkers.map((spot) => (
        <Card key={spot.spot_id} sx={{ display: "flex", mb: 2, borderRadius: 3, boxShadow: 2 }}>
          {/* <CardMedia
            component="img"
            image={spot.image || "/placeholder.jpg"}
            alt={spot.spot_title}
            sx={{ width: 100, height: 100, borderRadius: "12px 0 0 12px" }}
          /> */}

          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <CardContent sx={{ pb: 0 }}>
              <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Typography fontWeight="bold" noWrap>{spot.spot_title}</Typography>
              <Typography fontWeight="bold" sx={{ mt: 0.5 }}>
              ₹ {spot.hourly_rate}
              </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                🚶 {spot.walkingDuration} ({spot.walkingDistance})
                {/* ({calculateDistance({ lat: latlng.lat, lng: latlng.lng}, { lat: spot.latitude, lng: spot.longitude })} km ) */}
              </Typography>
              
            </CardContent>
            <CardActions>
              <Button size="small"
              onClick={() => {navigate(`/spotdetail/${spot.spot_id}`)
     console.log("Inside navigate ",spot.spot_id);
            }
            
            }
            variant="text"
              >Details</Button>
              <Button size="small" 
              >Book </Button>
            </CardActions>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default MarkerCard;
