/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from "@mui/material";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from "react-router-dom";
import "../style/spot.css";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../const";
import MapDialog from "../components/MapDialog";

const Spot = ({ onCancel }) => {
const [mapOpen, setMapOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [spotTitle, setSpotTitle] = useState("");
  const [spotAddress, setSpotAddress] = useState("");
  const [spotDescription, setSpotDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [openDays, setOpenDays] = useState({
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  });

  const toggleDay = (day) => {
    setOpenDays({ ...openDays, [day]: !openDays[day] });
  };
  /**
   * checking size of photo and reading a Base64 data
   * If file size greater than 2 MB gives a warning
   * @param {*} event
   * @returns
   */
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 2 * 1024 * 1024;

    const newImages = [];
    const newPreviews = [];
    let validateFile = [];
    console.log(files.length);
    for(let file of files) {
      console.log(file.size);
      if(file.size <= maxSize) validateFile.push(file)
    }
    console.log(validateFile)
    if(validateFile.length == 0) {
      setOpenSnackbar({open: true, message: "Images Should be less than 2MB", severity: "error"})
      return;
    }
    for (let file of validateFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result.split(",")[1]);
        newPreviews.push(reader.result);

        if (newImages.length === validateFile.length) {
          setImages((prev) => [...prev, ...newImages]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);

          setOpenSnackbar({
            open: true,
            message: "Photos uploaded successfully",
            severity: "success",
          });
        }
      };
      reader.readAsDataURL(file);
    }

    if(files.length != validateFile.length) {
      setOpenSnackbar({
        open: true,
        message: "Some files were skipped (over 2MB)",
        severity: "warning"
      })
    }
  };

  /**
   *  validate a form checking title, address, open time, close time,
   *  rates, and image
   * @returns string
   */

  const validateForm = () => {
    const total = parseInt(totalSlots);
    console.log(typeof totalSlots);
    console.log(typeof availableSlots);
    if (!spotTitle.trim()) return "Spot Title is required";
    if (!spotAddress.trim()) return "Address is required";
    if (location == null) return "Please select a location to proceed";
    setLatitude(location.lat);
    setLongitude(location.lng);
    if (!openTime) return "Open Time is required";
    if (!closeTime) return "Close Time is required";
    if (!hourlyRate || hourlyRate <= 0) return "Hourly Rate must be positive";
    if (!totalSlots || totalSlots <= 0)
      return "Total Slots must be a positive number";
    if (!Object.values(openDays).includes(true))
      return "At least one open day must be selected";
    console.log(total);
    console.log(typeof total);
    return total;
  };

  const handleDeleteImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  /**
   * checking latitude and longitude are within India
   * converting open time close time in indian standard time
   * Adding spot into databases after adding making every filed empty
   * @returns
   */
  const handleAddSpot = async () => {
    const error = validateForm();
    if (error)
      if (error && typeof error === "string") {
        setOpenSnackbar({ open: true, message: error, severity: "error" });
        return;
      }
    setTotalSlots(error);
    if (
      !(
        location.lat >= 6.554607 &&
        location.lat <= 35.674545 &&
        location.lng >= 68.162385 &&
        location.lng <= 97.395561
      )
    ) {
      setOpenSnackbar({
        open: true,
        message: "Please select a location within India",
        severity: "error",
      });

      return;
    }
    if (parseInt(openTime.split(":")[0]) > parseInt(closeTime.split(":")[0])) {
      setOpenSnackbar({
        open: true,
        message: "Enter Valid Open and Close time",
        severity: "error",
      });
      return;
    } else if (
      parseInt(openTime.split(":")[0]) == parseInt(closeTime.split(":")[0]) &&
      parseInt(openTime.split(":")[1]) >= parseInt(closeTime.split(":")[1])
    ) {
      setOpenSnackbar({
        open: true,
        message: "Enter Valid Open and Close time",
        severity: "error",
      });
      return;
    }
    setLoading(true);

    let open_days = [];

    for (const day in openDays) {
      if (openDays[day]) {
        open_days.push(day);
      }
    }

    console.log(openTime);
    let open = parseInt(openTime.split(":")[0]) >= 12 ? "PM" : "AM";
    let close = closeTime.split(":")[0] >= 12 ? "PM" : "AM";
    let new_open_time = openTime + " " + open;
    let new_close_time = closeTime + " " + close;
    setTotalSlots(parseInt(totalSlots));
    try {
      const response = await axios.post(`${BACKEND_URL}/spots/add-spot/`, {
        owner_id: user.id,
        spot_title: spotTitle,
        spot_address: spotAddress,
        spot_description: spotDescription,
        open_time: new_open_time,
        close_time: new_close_time,
        hourly_rate: hourlyRate,
        total_slots: totalSlots,
        available_slots: totalSlots,
        latitude: location.lat,
        longitude: location.lng,
        available_days: open_days,
        image: images,
      });

      if (response.status === 200) {
        setOpenSnackbar({
          open: true,
          message: "Parking spot added successfully!",
          severity: "success",
        });

        setSpotTitle("");
        setSpotAddress("");
        setSpotDescription("");

        setOpenTime("");
        setCloseTime("");
        setHourlyRate("");

        setTotalSlots("");
        setAvailableSlots("");
        setImages([]);
        setImagePreviews([]);
        setLocation(null);
        setLatitude("");
        setLongitude("");
        setOpenDays({
          Sun: false,
          Mon: false,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
        });
      }
    } catch (error) {
      setOpenSnackbar({
        open: true,
        message: "Error uploading data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="form-container">
      <Box className="form-box">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Add a Parking Spot
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Spot Title"
              value={spotTitle}
              onChange={(e) => setSpotTitle(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Spot Address"
                variant="outlined"
                value={spotAddress}
                onChange={(e) => setSpotAddress(e.target.value)}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setMapOpen(true)}
                sx={{
                  minWidth: 0,
                  px: 2,
                  mt: { xs: 0, sm: 2 },  
                  ml: { xs: 0, sm: 2 },
                  alignSelf: { xs: 'stretch', sm: 'center' },
                }}
              >
                <LocationOnIcon/>
              </Button>
              <Dialog
                open={showInstructions}
                onClose={() => setShowInstructions(false)}
              >
                <DialogTitle>How to Add a Parking Spot</DialogTitle>
                <DialogContent dividers>
                  <Typography gutterBottom>
                    Here are the steps to add a new parking spot:
                  </Typography>
									<Box component="ul" pl={2}>
                    <li>
                      Select a location using the "Location" button and
                      click on the map.
                    </li>
                    <li>
                      Fill in the spot name, total slots, open & close times,
                      and select available days.
                    </li>
                    <li>Upload images under 2MB each.</li>
                    <li>Click "Add Spot" to save your parking spot.</li>
									</Box>
									<Box display="flex" justifyContent="center" mt={3}>
										<img
											src="https://i.ibb.co/Z6MQ4mc6/instructon.png"
											alt="Parking Guide"
											style={{
												width: "100%",
												maxWidth: "350px",
												height: "auto",
												borderRadius: "12px"
											}}
										/>
									</Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowInstructions(false)}>
                    Got it!
                  </Button>
                </DialogActions>
              </Dialog>

              <MapDialog
                open={mapOpen}
                onClose={() => {setMapOpen(false)
                }}
                onSave={(coords, msg) => {
                  setLocation(coords);
                  console.log("Location:", coords);
                  if (msg == "success") {
                    setOpenSnackbar({
                      open: true,
                      message: "Location saved successfully!",
                      severity: "success",
                    });
                  }
                }}
                spotAddress={spotAddress}
                setLocation={setLocation}
              />
            </Stack>
          </Grid>

          {location != null ? (
            <Grid item xs={12}>
              <TextField
                disabled 
                fullWidth
                label="coordinates"
                value={
                  "Latitude: " + location.lat + ", Longitude: " + location.lng
                }
              />
            </Grid>
          ) : (
            <></>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Spot Description"
              multiline
              rows={3}
              value={spotDescription}
              onChange={(e) => setSpotDescription(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Open Time"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Close Time"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Hourly Rate (₹)"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Total Slots"
              type="number"
              value={totalSlots}
              onChange={(e) => setTotalSlots(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Select Open Days:</Typography>
            <Grid container spacing={1} justifyContent="center">
              {Object.keys(openDays).map((day) => (
                <Grid item key={day}>
                  <Button
                    variant={openDays[day] ? "contained" : "outlined"}
                    color={openDays[day] ? "primary" : "default"}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <input
              type="file"
              accept=".png, .jpeg"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload" style={{ marginBottom: "2px" }}>
              <Button
                variant="outlined"
                color="primary"
                component="span"
                sx={{ mt: 2 }}
              >
                Upload Images
              </Button>
            </label>
            {images ? (
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {imagePreviews.map((preview, index) => (
                  <Grid
                    item
                    xs={3}
                    key={index}
                    style={{ position: "relative" }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        marginTop: "10px",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(index)}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                    >
                      <DeleteIcon color="error"></DeleteIcon>
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <></>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddSpot}
            >
              Add Spot
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                onCancel();
              }}
            >
              Go Back
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={openSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar({ ...openSnackbar, open: false })}
      >
        <Alert severity={openSnackbar.severity} variant="filled">
          {openSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export { Spot };
