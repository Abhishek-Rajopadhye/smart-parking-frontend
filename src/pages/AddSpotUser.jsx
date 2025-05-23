import {
	Box,
	Button,
	Step,
	StepLabel,
	Stepper,
	TextField,
	Typography,
	Grid,
	Snackbar,
	Alert,
	IconButton,
	Stack,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import "../style/spot.css";
import MapDialog from "../components/MapDialog";
import { BACKEND_URL } from "../const";
const steps = ["Instruction", "Spot Details", "Instructions & Submit"];
let open_days = [];
const AddSpotUser = () => {
	const navigate = useNavigate();
	const [errorHandling, setErrorHandling] = useState({
		spotTitle: false,
		address: false,
		openTime: false,
		closeTime: false,
		hourlyRate: false,
		totalSlots: false,
		openDays: false,
	});
	const [activeStep, setActiveStep] = useState(0);
	// Spot Details States

	const [spotAdded, setSpotAdded] = useState(false);
	const [mapOpen, setMapOpen] = useState(false);
	const [location, setLocation] = useState(null);
	const [spotTitle, setSpotTitle] = useState("");
	const [spotAddress, setSpotAddress] = useState("");
	const [spotDescription, setSpotDescription] = useState("");
	const [openTime, setOpenTime] = useState("");
	const [closeTime, setCloseTime] = useState("");
	const [hourlyRate, setHourlyRate] = useState("");
	const [totalSlots, setTotalSlots] = useState("");
	const [images, setImages] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
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
		try {
			const files = Array.from(event.target.files);
			const maxSize = 2 * 1024 * 1024;

			const newImages = [];
			const newPreviews = [];
			let validateFile = [];
			for (let file of files) {
				if (file.size <= maxSize) validateFile.push(file);
			}
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
		} catch (error) {
			console.error(error);
			setOpenSnackbar({
				open: true,
				message: error,
				severity: "error",
			});
		}
	};

	/**
	 *  validate a form checking title, address, open time, close time,
	 *  rates, and image
	 * @returns string
	 */

	const validateForm = () => {
		try {
			setErrorHandling({
			spotTitle: false,
			address: false,
			openTime: false,
			closeTime: false,
			hourlyRate: false,
			totalSlots: false,
			openDays: false,
		});
		const total = parseInt(totalSlots);
		let flag = false, msg = "Required fields are missing";
		if (!spotTitle.trim()) {
			setErrorHandling((prev) => ({ ...prev, spotTitle: true }));
			//return "Spot Title is required";
			flag = true;
		}
		if (!spotAddress.trim()) {
			setErrorHandling((prev) => ({ ...prev, address: true }));
			//return "Spot Address is required";
			flag = true;
		}
		if (location == null) {
			setErrorHandling((prev) => ({ ...prev, location: true }));
			msg = "Please select a location to proceed";
			flag = true;
		}
		if (!openTime) {
			setErrorHandling((prev) => ({ ...prev, openTime: true }));
			// return "Open Time is required";
			flag = true;
		}
		if (!closeTime) {
			setErrorHandling((prev) => ({ ...prev, closeTime: true }));
			// return "Close Time is required";
			flag = true;
		}
		if (!hourlyRate || hourlyRate <= 0) {
			setErrorHandling((prev) => ({ ...prev, hourlyRate: true }));
			//return "Hourly Rate must be positive";
			flag = true;
		}
		if (!totalSlots || totalSlots <= 0) {
			setErrorHandling((prev) => ({ ...prev, totalSlots: true }));
			//return "Total Slots must be a positive number";
			flag = true;
		}
		if (!Object.values(openDays).includes(true)) {
			setErrorHandling((prev) => ({ ...prev, openDays: true }));
			if(!flag)
				msg = "At least one open day must be selected";
			flag = true;
		}
		if (flag) {
			return msg;
		}
		return total;
		} catch (error) {
			console.error(error);
			setOpenSnackbar({
				open: true,
				message: error,
				severity: "error",
			});
		}
	};

	/**
	 * handle delete image from the preview
	 * @param {*} index - index of the image to be deleted
	 */
	const handleDeleteImage = (index) => {
		try {
			const newImages = [...images];
			const newPreviews = [...imagePreviews];
			newImages.splice(index, 1);
			newPreviews.splice(index, 1);
			setImages(newImages);
			setImagePreviews(newPreviews);
		} catch (error) {
			console.error(error);
			setOpenSnackbar({
				open: true,
				message: error,
				severity: "error",
			});
		}
	};

	/**
	 * Adding spot into databases after adding making every filed empty
	 * @param {*} e - onclick event on submit button
	 * @returns
	 */
	const handleSubmit = async () => {
		if (spotAdded) return;
		const formData = new FormData();
		formData.append("owner_id", "google-oauth2|1234567890");
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
		formData.append("available_days", open_days);
		images.forEach((img) => {
			formData.append("image", img);
		});
		formData.append("verification_status", 3);

		try {
			console.log(images.length);
			const response = await axios.post(`${BACKEND_URL}/spots/add-spot`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (response.status == 200) {
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
				setImages([]);
				setImagePreviews([]);
				setLocation(null);
				open_days = [];
				setOpenDays({
					Sun: false,
					Mon: false,
					Tue: false,
					Wed: false,
					Thu: false,
					Fri: false,
					Sat: false,
				});
				setOpenSnackbar({
					open: true,
					message: "Spot Added Successfully",
					severity: "success",
				});
				setTimeout(() => {
					navigate("/homepage");
				}, 3000);
			}
		} catch (error) {
			console.error(error);
			open_days = [];
			setOpenSnackbar({
				open: true,
				message: "Error uploading data",
				severity: "error",
			});
		}
	};

	/**
	 * Handles the next button click in the stepper.
	 * Validates the form data and moves to the next step.
	 * If on the last step, it submits the form.
	 * @param {*} e - Event triggered on button click.
	 * @returns
	 */
	const handleNext = () => {
		try {
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

			if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
			else handleSubmit();
		} catch (error) {
			console.error(error);
			setOpenSnackbar({
				open: true,
				message: error,
				severity: "error",
			});
		}
	};

	const handleBack = () => setActiveStep((prev) => prev - 1);

	return (
		<Box
			sx={{
				minHeight: "35vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				px: 2,
				paddingTop: "10px",
				backgroundColor: "#ffffff",
			}}
		>
			<Box
				sx={{
					width: "100%",
					maxWidth: 600,
					bgcolor: "white",
					color: "black",
					p: 4,
				}}
			>
				<Grid item xs={12}>
					<Typography sx={{ color: "black" }} variant="h5" gutterBottom textAlign="center">
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
					<Box sx={{ color: "black" }}>
						<Typography gutterBottom>Here are the steps to add a new parking spot:</Typography>
						<Box component="ul" pl={2}>
							<li>Select a location using the "Location" button and click on the map.</li>
							<li>Fill in the spot name, total slots, open & close times, and select available days.</li>
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
						<Typography variant="body1" mb={2} color="secondary" textAlign="center">Mandatory fields are marked with *</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Spot Title*"
										value={spotTitle}
										onChange={(e) => setSpotTitle(e.target.value)}
										error={errorHandling.spotTitle}
									/>
								</Grid>

								<Grid item xs={12}>
									<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
										<TextField
											fullWidth
											label="Spot Address*"
											variant="outlined"
											value={spotAddress}
											onChange={(e) => setSpotAddress(e.target.value)}
											error={errorHandling.address}
										/>
										<Button
											color={errorHandling.location ? "error" : "primary"}
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
											value={"Latitude: " + location.lat + ", Longitude: " + location.lng}
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
										error={errorHandling.description}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField
										fullWidth
										label="Open Time*"
										type="time"
										value={openTime}
										onChange={(e) => setOpenTime(e.target.value)}
										error={errorHandling.openTime}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField
										fullWidth
										label="Close Time*"
										type="time"
										value={closeTime}
										onChange={(e) => setCloseTime(e.target.value)}
										viewRenderers={{
											hours: renderTimeViewClock,
											minutes: renderTimeViewClock,
										}}
										error={errorHandling.closeTime}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField
										fullWidth
										label="Hourly Rate(₹)*"
										type="number"
										value={hourlyRate}
										onChange={(e) => setHourlyRate(e.target.value)}
										error={errorHandling.hourlyRate}
									/>
								</Grid>

								<Grid item xs={6}>
									<TextField
										fullWidth
										label="Total Slots*"
										type="number"
										value={totalSlots}
										onChange={(e) => setTotalSlots(e.target.value)}
										error={errorHandling.totalSlots}
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography variant="subtitle1" color={errorHandling.openDays ? "red" : "black"}>Select Open Days:*</Typography>
									<Grid container spacing={1} justifyContent="center">
										{Object.keys(openDays).map((day) => (
											<Grid item key={day}>
												<Button
													variant={openDays[day] ? "contained" : "outlined"}
													color="primary"
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
										<Button variant="outlined" color="primary" component="span" sx={{ mt: 2 }}>
											Upload Images
										</Button>
									</label>
									{images ? (
										<Grid container spacing={1} sx={{ mt: 2 }}>
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
											<Grid item xs={12} mt={4} sx={{paddingBottom: "10px"}}>
												<Box display="flex" justifyContent="space-between" sx={{paddingBottom: "2px"}}>
													<Button disabled={activeStep === 0} onClick={handleBack}>
														Back
													</Button>
													<Button variant="contained" onClick={handleNext}>
														{activeStep === steps.length - 1 ? "Submit" : "Next"}
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
				{spotAdded && (
					<Box>
						<Typography variant="h6" color="green" textAlign="center">
							Spot Added Successfully!
						</Typography>
					</Box>
				)}
				{/* Step 3: Instructions + Submit */}
				{activeStep === 2 && (
					<Box sx={{ p: 4 }}>
						<Typography variant="body1" mb={2} sx={{ color: "black" }}>
							📍 This spot is only for viewing purposes on the map.
							<br /><br/>
							🛑 Booking or reservation is not available for this spot.
							<br /><br/>
							💡 Want to earn by listing your own spot? Log in as an owner and add a spot to make it bookable.
						</Typography>
						<Grid item xs={12} mt={4}>
							<Box display="flex" justifyContent="space-between">
								<Button disabled={activeStep === 0 || spotAdded} onClick={handleBack}>
									Back
								</Button>
								<Button variant="contained" onClick={handleNext} disabled={spotAdded}>
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
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export { AddSpotUser };
