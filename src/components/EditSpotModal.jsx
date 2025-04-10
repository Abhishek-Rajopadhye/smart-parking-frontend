import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const EditSpotForm = ({ spotDetails, onCancel, onSave }) => {
    const [spotTitle, setSpotTitle] = useState(spotDetails.title || "");
    const [spotDescription, setSpotDescription] = useState(spotDetails.description || "");
    const [spotAddress, setSpotAddress] = useState(spotDetails.address || "");
    const [openTime, setOpenTime] = useState(spotDetails.openTime || "");
    const [closeTime, setCloseTime] = useState(spotDetails.closeTime || "");
    const [hourlyRate, setHourlyRate] = useState(spotDetails.hourlyRate || "");
    const [totalSlots, setTotalSlots] = useState(spotDetails.totalSlots || "");
    const [images, setImages] = useState(spotDetails.images || []);
    const [imagePreviews, setImagePreviews] = useState(spotDetails.imagePreviews || []);
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

	const handleDeleteImage = (index) => {
		const newImages = [...images];
		const newPreviews = [...imagePreviews];
		newImages.splice(index, 1);
		newPreviews.splice(index, 1);
		setImages(newImages);
		setImagePreviews(newPreviews);
	};

    const handleSave = () => {
        // Placeholder for save logic
        console.log("Save logic here");
        onSave()
    };

    return (
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
                        <label htmlFor="image-upload">
                            <Button variant="outlined" color="primary" component="span">
                                Upload Images
                            </Button>
                        </label>
                        {images.length > 0 && (
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
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={onCancel}
                        >
                            Cancel
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

export { EditSpotForm };