import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LocalizationProvider,
  DateCalendar,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { isBefore, addMinutes, setHours, setMinutes } from "date-fns";

const DateTimePicker = ({selectedDate,setSelectedDate,startTime,setStartTime,endTime,setEndTime,onClose}) => {
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingType, setBookingType] = useState("single");
  // const [startTime, setStartTime] = useState(null);
  // const [endTime, setEndTime] = useState(null);
  const [minEndTime, setMinEndTime] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getInitialStartTime = (date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (!isToday) return setHours(setMinutes(new Date(date), 0), 8);

    const roundedMinutes = now.getMinutes() <= 30 ? 30 : 60;
    return setMinutes(
      addMinutes(now, roundedMinutes - (now.getMinutes() % 30)),
      0
    );
  };

  useEffect(() => {
    const initialStart = getInitialStartTime(selectedDate);
    const defaultEnd = addMinutes(initialStart, 30);
    setStartTime(initialStart);
    setEndTime(defaultEnd);
    setMinEndTime(defaultEnd);
  }, [selectedDate]);

  const handleStartTimeChange = (newTime) => {
    setStartTime(newTime);
    const newMinEnd = addMinutes(newTime, 30);
    setMinEndTime(newMinEnd);
    setEndTime((prevEnd) =>
      isBefore(prevEnd, newMinEnd) ? newMinEnd : prevEnd
    );
  };

  const handleSubmit = () => {
    console.log("Selected Date:", selectedDate.toDateString());
    console.log("Enter After:", startTime?.toLocaleTimeString());
    console.log("Exit Before:", endTime?.toLocaleTimeString());
    if(onClose) onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>  
      <Box clasName="container-date-time" sx={{ p: 4, borderRadius: 2, boxShadow: 3, bgcolor: "#fff", mx: "auto" }}>
                <Typography fontWeight="bold" gutterBottom>
                    When do you need to park?
                </Typography>


                <Typography variant="body2" mb={2}>
                    Select a single date or a range of several days— however long you need a spot!
                </Typography>
      
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "#fff",
          maxWidth: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
          overflow: "hidden",
        }}
      >
        {/* Left: Calendar and Booking Type */}
        <Box sx={{ flex: 1 }}>
          <DateCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            disablePast
            sx={{
                width: "100%",
                maxWidth: "100%",
                ".MuiPickersCalendarHeader-root": { justifyContent: "space-between" },
              }}
          />
        </Box>

        {/* Right: Time Pickers and Submit */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography fontWeight="bold">Starting</Typography>
            <Typography variant="caption" gutterBottom>
              {selectedDate.toDateString()}
            </Typography>
            <TimePicker
              label="Enter After"
              value={startTime}
              onChange={handleStartTimeChange}
              minutesStep={30}
              ampm
              minTime={getInitialStartTime(selectedDate)}
              maxTime={setHours(setMinutes(selectedDate, 30), 23)}
              sx={{ mt: 1, width: "100%" }}
    
            />
          </Box>

          <Box>
            <Typography fontWeight="bold">Ending</Typography>
            <Typography variant="caption" gutterBottom>
              {selectedDate.toDateString()}
            </Typography>
            <TimePicker
              label="Exit Before"
              value={endTime}
              onChange={(newTime) => setEndTime(newTime)}
              minutesStep={30}
              ampm
              minTime={minEndTime}
              maxTime={setHours(setMinutes(selectedDate, 30), 23)}
              sx={{ mt: 1, width: "100%" }}
            />
          </Box>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 3,
              width: "100%",
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DateTimePicker;
