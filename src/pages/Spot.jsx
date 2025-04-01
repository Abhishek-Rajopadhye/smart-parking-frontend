import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, CircularProgress, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../style/spot.css";

const Spot = ({ userId }) => {
	const navigate = useNavigate();
	// eslint-disable-next-line no-unused-vars
	const [imageSrc, setImageSrc] = useState(null);
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
	const [image, setImage] = useState(null);
	// eslint-disable-next-line no-unused-vars
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState({ open: false, message: "", severity: "info" });
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

	const handleImageChange = (event) => {
		const file = event.target.files[0];
		const maxSize = 2 * 1024 * 1024;
		if (file.size > maxSize) {
			setOpenSnackbar({ open: true, message: "File Size should be less than 2MB", severity: "error" });
			setImage(null);
			return;
		}

		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => {
				setImage(reader.result.split(",")[1]); // Extract Base64 data
				setImagePreview(reader.result);
			};
		}
	};
	// Validate form

	const validateForm = () => {
		if (!spotTitle.trim()) return "Spot Title is required";

		if (!spotAddress.trim()) return "Address is required";

		if (!openTime) return "Open Time is required";

		if (!closeTime) return "Close Time is required";

		if (!hourlyRate || hourlyRate <= 0) return "Hourly Rate must be positive";

		if (!totalSlots || totalSlots <= 0) return "Total Slots must be a positive number";

		if (!availableSlots || availableSlots < 0) return "Available Slots cannot be negative";

		if (parseInt(availableSlots) > parseInt(totalSlots)) return "Available Slots cannot exceed Total Slots";

		if (!Object.values(openDays).includes(true)) return "At least one open day must be selected";

		return null;
	};

	const handleAddSpot = async () => {
		if (!(latitude >= 6.554607 && latitude <= 35.674545 && longitude >= 68.162385 && longitude <= 97.395561)) {
			setOpenSnackbar({ open: true, message: "Only India Coordinates allowed", severity: "error" });

			return;
		}

		const error = validateForm();

		if (error) {
			setOpenSnackbar({ open: true, message: error, severity: "error" });

			return;
		}

		//fetchCoordinates();

		if (latitude === "" || longitude === "") {
			setOpenSnackbar({ open: true, message: "Invalid Address", severity: "error" });

			return;
		}

		setLoading(true);

		console.log("Latitude:", latitude);

		console.log("Longitude:", longitude);

		console.log("Spot Title:", spotTitle);

		console.log("Spot Address:", spotAddress);

		console.log("Spot Description:", spotDescription);

		console.log("Open Time:", openTime);

		console.log("Close Time:", closeTime);

		console.log("Hourly Rate:", hourlyRate);

		console.log("Total Slots:", totalSlots);

		console.log("Available Slots:", availableSlots);

		let open_days = [];

		for (const day in openDays) {
			if (openDays[day]) {
				open_days.push(day);
			}
		}

		let open = parseInt(openTime.split(":")[0]) >= 12 ? "PM" : "AM";

		let close = closeTime.split(":")[0] >= 12 ? "PM" : "AM";

		let new_open_time = openTime + " " + open;

		let new_close_time = closeTime + " " + close;

		console.log("Open Days:", open_days);

		try {
			const response = await axios.post("http://localhost:8000/spots/add-spot/", {
				owner_id: userId,

				spot_title: spotTitle,

				spot_address: spotAddress,

				spot_description: spotDescription,

				open_time: new_open_time,

				close_time: new_close_time,

				hourly_rate: hourlyRate,

				total_slots: totalSlots,

				available_slots: availableSlots,

				latitude,

				longitude,

				available_days: open_days,

				image: image || "",
			});

			if (response.status === 200) {
				setOpenSnackbar({ open: true, message: "Parking spot added successfully!", severity: "success" });

				setSpotTitle("");
				setSpotAddress("");
				setSpotDescription("");

				setOpenTime("");
				setCloseTime("");
				setHourlyRate("");

				setTotalSlots("");
				setAvailableSlots("");
				setImage(null);
				setImagePreview(null);

				setLatitude("");
				setLongitude("");

				setOpenDays({ Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false });
			}
		} catch (error) {
			console.log(error);
			setOpenSnackbar({ open: true, message: "Error uploading data", severity: "error" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="form-container">
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
							<TextField
								fullWidth
								label="Spot Address"
								value={spotAddress}
								onChange={(e) => setSpotAddress(e.target.value)}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Spot Latitude"
								value={latitude}
								onChange={(e) => setLatitude(e.target.value)}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Spot Longitude"
								value={longitude}
								onChange={(e) => setLongitude(e.target.value)}
							/>
						</Grid>

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

						<Grid item xs={6}>
							<TextField
								fullWidth
								label="Available Slots"
								type="number"
								value={availableSlots}
								onChange={(e) => setAvailableSlots(e.target.value)}
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
								onChange={handleImageChange}
								style={{ display: "none" }}
								id="image-upload"
							/>

							<label htmlFor="image-upload">
								<Button variant="outlined" color="primary" component="span">
									Upload Image
								</Button>
							</label>
						</Grid>

						<Grid item xs={12}>
							<Button variant="contained" color="primary" fullWidth onClick={handleAddSpot} disabled={loading}>
								{loading ? <CircularProgress size={24} /> : "Add Spot"}
							</Button>
						</Grid>

						<Grid item xs={12}>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								onClick={() => {
									navigate(-1);
								}}
							>
								Go Back
							</Button>
						</Grid>
					</Grid>
				</Box>
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
