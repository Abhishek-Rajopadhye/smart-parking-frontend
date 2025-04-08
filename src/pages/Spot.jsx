import React, { useState, useContext } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, IconButton } from "@mui/material";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";

import "../style/spot.css";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../const";
import MapDialog from "../components/MapDialog";

const Spot = () => {
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
	// eslint-disable-next-line no-unused-vars
	const [loading, setLoading] = useState(false);
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

		for (let file of files) {
			if (file.size > maxSize) {
				setOpenSnackbar({
					open: true,
					message: "Each file must be less than 2MB",
					severity: "error",
				});
				continue;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				newImages.push(reader.result.split(",")[1]);
				newPreviews.push(reader.result);

				if (newImages.length === files.length) {
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
	};

	/**
	 *  validate a form checking title, address, open time, close time,
	 *  rates, and image
	 * @returns string
	 */

	const validateForm = () => {
		if (!spotTitle.trim()) return "Spot Title is required";
		if (!spotAddress.trim()) return "Address is required";
		if (location == null) return "Please select a location to proceed";
		setLatitude(location.lat);
		setLongitude(location.lng);
		setAvailableSlots(totalSlots);
		if (!openTime) return "Open Time is required";
		if (!closeTime) return "Close Time is required";
		if (!hourlyRate || hourlyRate <= 0) return "Hourly Rate must be positive";
		if (!totalSlots || totalSlots <= 0) return "Total Slots must be a positive number";
		if (!Object.values(openDays).includes(true)) return "At least one open day must be selected";
		return null;
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
		if (error) {
			setOpenSnackbar({ open: true, message: error, severity: "error" });
			return;
		}
		//console.log(openTime);
		alert(latitude);
		alert(longitude);
		if (!(latitude >= 6.554607 && latitude <= 35.674545 && longitude >= 68.162385 && longitude <= 97.395561)) {
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
		console.log("Open Days:", open_days);

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
				available_slots: availableSlots,
				latitude,
				longitude,
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
			console.log(error);
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
		// <Box className="main">
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
						<label htmlFor="image-upload" style={{ marginBottom: "5px" }}>
							<Button variant="outlined" color="primary" component="span">
								Upload Images
							</Button>
							<Button variant="outlined" onClick={() => setMapOpen(true)} sx={{ ml: 2 }}>
								Set Location
							</Button>

							<MapDialog
								open={mapOpen}
								onClose={() => setMapOpen(false)}
								onSave={(coords, msg) => {
									setLocation(coords);
									if (msg == "success") {
										setOpenSnackbar({
											open: true,
											message: "Location saved successfully!",
											severity: "success",
										});
									}
								}}
							/>
						</label>
						{images ? (
							<Grid container spacing={1}>
								{imagePreviews.map((preview, index) => (
									<Grid item xs={3} key={index} style={{ position: "relative" }}>
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
							// disabled={loading}
						>
							{/* {loading ? <CircularProgress size={24} /> : "Add Spot"} */}
							Add Spot
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
