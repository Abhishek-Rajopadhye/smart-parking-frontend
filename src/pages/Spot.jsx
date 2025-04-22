import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
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
import { useState } from "react";
import React, { useContext } from "react";
import axios from "axios";
import {

} from "@mui/material";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { useNavigate } from "react-router-dom";
import "../style/spot.css";
import MapDialog from "../components/MapDialog";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../const";
const steps = [
  "Instruction",
  "Spot Details",
  "Upload Documents",
  "Instructions & Submit",
];

const Spot = ({ onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Spot Details States
  const [spotAdded, setSpotAdded] = useState(false);
  const [spotName, setSpotName] = useState("");
  const [spotPrice, setSpotPrice] = useState("");
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
  const [openDay, setOpenDay] = useState("");
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
    for (let file of files) {
      console.log(file.size);
      if (file.size <= maxSize) validateFile.push(file);
    }
    console.log(validateFile);
    if (validateFile.length == 0) {
      setOpenSnackbar({
        open: true,
        message: "Images Should be less than 2MB",
        severity: "error",
      });
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

    if (files.length != validateFile.length) {
      setOpenSnackbar({
        open: true,
        message: "Some files were skipped (over 2MB)",
        severity: "warning",
      });
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
  const handleSubmit = async () => {
    if (spotAdded) return;
    const formData = new FormData();
    formData.append("owner_id", user.id);
    formData.append("spot_title", spotTitle);
    formData.append("spot_address", spotAddress);
    formData.append("spot_description", spotDescription);
    formData.append("open_time", openTime);
    formData.append("close_time", closeTime);
    formData.append("hourly_rate", hourlyRate);
    formData.append("total_slots", totalSlots);
    formData.append("available_slots", totalSlots);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
    formData.append("available_days", openDay.join(","));
    formData.append("image", images);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/spots/add-spot`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        const document = new FormData();
        document.append("spot_id", response.data.spot_id);
        document.append("doc1", documents.doc1);
        document.append("doc2", documents.doc2);
        document.append("doc3", documents.doc3);
        const document_response = await axios.post(
          `${BACKEND_URL}/spots/add-documents`,
          document,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (document_response.status == 200) {
          setSpotAdded(true);
          setOpenSnackbar({
            open: true,
            message: "Spot Added Successfully",
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
          documents.doc1 = null;
          documents.doc2 = null;
          documents.doc3 = null;
        }
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

  // Document Uploads
  const [documents, setDocuments] = useState({
    doc1: null,
    doc2: null,
    doc3: null,
  });

  const handleDocumentChange = (e, docKey) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setDocuments((prev) => ({ ...prev, [docKey]: file }));
    } else {
      alert("Please upload a valid PDF document");
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      setSpotAdded(false);
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
      if (
        parseInt(openTime.split(":")[0]) > parseInt(closeTime.split(":")[0])
      ) {
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
      setOpenDay(open_days);
      let open = parseInt(openTime.split(":")[0]) >= 12 ? "PM" : "AM";
      let close = closeTime.split(":")[0] >= 12 ? "PM" : "AM";
      let new_open_time = openTime + " " + open;
      let new_close_time = closeTime + " " + close;
      setOpenTime(new_open_time);
      setCloseTime(new_close_time);
      setTotalSlots(parseInt(totalSlots));
    }

    if (
      activeStep === 2
    ) {
      let msg = "";
      if(!documents.doc1) msg += "Identification Document, ";
      else if(!documents.doc2) msg += "Proof of Ownership Document, ";
      setOpenSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
      return;
    }

    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          bgcolor: "white",
          p: 4,
        }}
      >
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom textAlign="center">
            Add a Parking Spot
          </Typography>
        </Grid>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
          <Box>
            <Typography gutterBottom>
              Here are the steps to add a new parking spot:
            </Typography>
            <Box component="ul" pl={2}>
              <li>
                Select a location using the "Location" button and click on the
                map.
              </li>
              <li>
                Fill in the spot name, total slots, open & close times, and
                select available days.
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
                  borderRadius: "12px",
                }}
              />
            </Box>
            <Grid item xs={12} mt={4}>
              <Box display="flex" justifyContent="space-between">
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </Box>
            </Grid>
          </Box>
        )}
        {/* Step 1: Spot Details */}
        {activeStep === 1 && (
          <Box className="form-container">
            <Box className="form-box">
              <Grid container spacing={2}>
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
                        alignSelf: { xs: "stretch", sm: "center" },
                      }}
                    >
                      <LocationOnIcon />
                    </Button>

                    <MapDialog
                      open={mapOpen}
                      onClose={() => {
                        setMapOpen(false);
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
                        "Latitude: " +
                        location.lat +
                        ", Longitude: " +
                        location.lng
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
                      <Grid item xs={12} mt={4}>
                        <Box display="flex" justifyContent="space-between">
                          <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                          >
                            Back
                          </Button>
                          <Button variant="contained" onClick={handleNext}>
                            {activeStep === steps.length - 1
                              ? "Submit"
                              : "Next"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <></>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Step 2: Upload Documents */}
        {activeStep === 2 && (
          <Box display="flex" flexDirection="column" gap={3}>
            {["Identification", "Proof Of Ownership", "Supporting Document"].map((docKey, index) => (
              <Box key={docKey}>
                <Button variant="contained" component="label">
                  {docKey === "Supporting Document"
                  ? `Optional Document for Proof of Ownership`
                  : `${docKey} Document (PDF)`}
                  <input
                    hidden
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleDocumentChange(e, docKey)}
                  />
                </Button>

                {/* Show preview if file exists */}
                {documents[docKey] && (
                  <Box mt={1}>
                    <Typography variant="body2">
                      📄 {documents[docKey].name} -{" "}
                      <a
                        href={URL.createObjectURL(documents[docKey])}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                        }}
                      >
                        View
                      </a>
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}

            <Grid item xs={12} mt={4}>
              <Box display="flex" justifyContent="space-between">
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </Box>
            </Grid>
          </Box>
        )}
        {spotAdded && (
          <Box>
            <Typography variant="h6" color="green" textAlign="center">
              Spot Added Successfully!
            </Typography>
          </Box>
        )}
        {/* Step 3: Instructions + Submit */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="body1" mb={2}>
              Please review your details and ensure all information and
              documents are correct. Once submitted, you won’t be able to edit.
              Document verification may take up to 24 hours. After verification,
              Spot will be live on the platform.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Spot: {spotName}, Price: ₹{spotPrice}, Slots: {totalSlots}
            </Typography>
            <Grid item xs={12} mt={4}>
              <Box display="flex" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0 || spotAdded}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={spotAdded}
                >
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </Box>
            </Grid>
          </Box>
        )}

        {/* Navigation Buttons */}

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
      {/* </Box> */}
    </Box>
  );
};

export { Spot };
