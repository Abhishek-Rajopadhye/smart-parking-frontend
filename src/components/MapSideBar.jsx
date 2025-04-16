import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
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

const MapSidebar = ({ mapRef, setNewMarker, setSelectedMarker, markers, setFilters ,filteredMarkers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [latlng, setLatLng] = useState("null")
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


  //console.log("searched loatino ", searchLocation);
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

  const handleSuggestionClick = async (description) => {
    setTempLocation(description);
    setSuggestions(false);
    setPredictions([]);
  };


  const handleClearSearch = () => {
    setTempLocation('');
    setSuggestions(false);
    setPredictions([]);
  };

  const handleUpdateSearch = () => {
    setSearchLocation(tempLocation);
    setSelectedDate(tempDate);
    setStartTime(tempStartTime);
    setEndTime(tempEndTime);

    console.log("Selected Date:", tempDate.toDateString());
    console.log("Selected Day:", tempDate.toLocaleDateString('en-US', { weekday: 'short' }));
    const weekDay = tempDate.toLocaleDateString('en-US', { weekday: 'short' });
    console.log("time ", tempStartTime, tempEndTime);
    if (tempDate) {
      setFilters((prev) => ({ ...prev, available_days: [weekDay] }));
    }
    if (tempStartTime) {
      setFilters((prev) => ({ ...prev, open_time: (tempStartTime?.getHours() || 0) + ":" + (tempStartTime?.getMinutes().toString().padStart(2, '0')) }));
      console.log("Enter After:", (tempStartTime?.getHours() || 0) + ":" + (tempStartTime?.getMinutes().toString().padStart(2, '0')));

    }

    if (tempEndTime) {
      setFilters((prev) => ({ ...prev, close_time: (tempEndTime?.getHours() || 0) + ":" + (tempEndTime?.getMinutes().toString().padStart(2, '0')) }));
      console.log("Exit Before:", (tempEndTime?.getHours() || 0) + ":" + (tempEndTime?.getMinutes().toString().padStart(2, '0')));

    }


    // Optional: Get lat/lng using Geocoder
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: tempLocation }, async (results, status) => {
      if (status === 'OK' && results[0]) {
        const latLng = await getLatLng(results[0]);
        setLatLng(latLng);

        const newSearchMarker = { name: tempLocation, location: latLng };
        setNewMarker(newSearchMarker);
        setSelectedMarker(newSearchMarker);

        console.log("latlng ", latLng);
        if (mapRef.current) {
          mapRef.current.panTo(latLng);
          mapRef.current.setZoom(14);
          //mapRef.current.setCenter(latLng);
        }


      }
    });

    console.log("Filtering with temp values:", {
      tempLocation,
      tempStartTime,
      tempEndTime,
      tempDate,
    });
  };

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
        {/* Book Parking Near */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Book Parking Near
        </Typography>

        <TextField
          fullWidth
          placeholder=" "
          value={tempLocation}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ position: 'absolute', left: '10px' }}>
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchLocation && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { pl: 4, mb: 3 }
          }}
          sx={{
            '& .MuiOutlinedInput-input': {
              py: 2
            }
          }}
          autoComplete="off"
        />
        {suggestions && predictions.length > 0 && (
          <Paper sx={{
            position: 'absolute',
            width: '100%',
            zIndex: 1100,
            mt: 0.5,
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            bgcolor: "background.paper"
          }}>
            {predictions.map((prediction, index) => (
              <Box
                key={index}
                onClick={() => handleSuggestionClick(prediction.description)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Typography variant="body2">
                  {prediction.description}
                </Typography>
              </Box>
            ))}

            <Box sx={{
              borderTop: '1px solid rgba(0,0,0,0.1)',
              p: 1,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Box component="img"
                src="/api/placeholder/144/18"
                alt="Powered by Google"
                sx={{ height: '18px' }}
              />
            </Box>
          </Paper>
        )}

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
        {/* Enter After */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
          Enter After
        </Typography>
        <Box display="flex" gap={1} mb={3}>

          <TimePicker
            value={tempStartTime}
            onChange={setTempStartTime}
            ampm
            minTime={getInitialStartTime(tempDate)}
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
        </Box>
        {/* Exit Before */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
          Exit Before
        </Typography>
        <Box display="flex" gap={1} mb={3}>
          <TimePicker
            value={tempEndTime}
            onChange={setTempEndTime}
            ampm
            minutesStep={30}
            minTime={tempStartTime}
            maxTime={setHours(setMinutes(selectedDate, 30), 23)}
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
        </Box>

        <Button variant="contained" fullWidth onClick={handleUpdateSearch}>
          Update Search
        </Button>
        <Box sx={{ bgcolor: "red", mt: 2 }}>
          <MarkerCard
            markers={filteredMarkers}
            origin={searchLocation}
            latlng={latlng}
          />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default MapSidebar;
