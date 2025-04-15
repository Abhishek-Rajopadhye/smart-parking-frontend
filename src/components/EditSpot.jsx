import {
	Button,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
	Grid,
	TextField,
	Input,
	InputLabel,
	Box,
	IconButton,
	Snackbar,
	Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConfirmationDialogBox } from "./ConfirmationDialogBox";
import { useState } from "react";

const EditSpot = ({ open, handleClose, spot, handleSave }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [confirmationMessage, setConfirmationMessage] = useState(null);
	const [action, setAction] = useState(null);
	const [formData, setFormData] = useState({
		spot_title: spot.spot_title || "",
		spot_address: spot.spot_address || "",
		spot_description: spot.spot_description || "",
		open_time: spot.open_time || "",
		close_time: spot.close_time || "",
		hourly_rate: spot.hourly_rate || "",
		total_slots: spot.total_slots || "",
		image: spot.image || [],
	});
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	/**
	 * Handles input field changes.
	 *
	 * Updates the corresponding field in the form data state.
	 *
	 * @param {Object} event - The input change event.
	 */
	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	/**
	 * Handles the image file upload.
	 *
	 * Validates the file size and converts the image to a Base64 string for submission.
	 *
	 * @param {Object} event - The file input change event.
	 */
	const handleImageChange = (event) => {
		const files = Array.from(event.target.files);
		const maxSize = 2 * 1024 * 1024;

		files.forEach((file) => {
			if (file.size > maxSize) {
				setOpenSnackbar({
					open: true,
					message: "File size should be less than 2MB",
					severity: "error",
				});
				return;
			}

			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => {
				setFormData((prevData) => ({
					...prevData,
					image: [...prevData.image, reader.result.split(",")[1]], // Add image to the array
				}));
			};
		});

		// Reset the input value to allow re-uploading
		event.target.value = null;
	};

	/**
	 * Handles the deletion of an uploaded image.
	 *
	 * Removes the selected image from the preview and the form data.
	 *
	 * @param {number} index - The index of the image to delete.
	 */
	const handleDeleteImage = (index) => {
		setFormData((prevData) => ({
			...prevData,
			image: prevData.image.filter((_, i) => i !== index),
		}));
	};

	/**
	 * Handles the cancel button click.
	 *
	 * Opens the confirmation dialog to confirm cancellation.
	 */
	const handleCancelClick = () => {
		setAction("Cancel");
		setConfirmationMessage("Are you sure you want to cancel editing the spot?");
		setConfirmationOpen(true);
	};

	/**
	 * Handles the confirm button click.
	 *
	 * Opens the confirmation dialog to confirm saving the changes.
	 */
	const handleConfirmClick = () => {
		setAction("Confirm");
		setConfirmationMessage("Are you sure you want to save these details?");
		setConfirmationOpen(true);
	};

	/**
	 * Handles the confirmation of saving changes.
	 *
	 * Calls the handleSave function with the updated form data.
	 */
	const onConfirmConfirmation = () => {
		handleSave(formData);
	};

	/**
	 * Handles the confirmation of cancellation.
	 *
	 * Closes the dialog and resets the confirmation state.
	 */
	const onConfirmCancellation = () => {
		setConfirmationOpen(false);
		setAction(null);
		setConfirmationMessage(null);
	};

	/**
	 * Handles the cancellation of the confirmation dialog.
	 *
	 * Resets the confirmation state and closes the edit spot dialog.
	 */
	const onCancelConfirmation = () => {
        setConfirmationOpen(false);
		setAction(null);
		setConfirmationMessage(null);
		handleClose();
	};

	/**
	 * Handles the cancellation of the confirmation dialog for cancellation.
	 *
	 * Closes the confirmation dialog and resets the confirmation state.
	 */
	const onCancelCancellation = () => {
		setConfirmationOpen(false);
		setAction(null);
		setConfirmationMessage(null);
	};

	return (
		<>
			<Dialog
				open={open}
				scroll="paper"
				onClose={handleClose}
				slotProps={{
					paper: {
						component: "form",
					},
				}}
			>
				<DialogTitle>{spot.spot_title}</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Spot Title"
								name="spot_title"
								value={formData.spot_title}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Spot Address"
								name="spot_address"
								value={formData.spot_address}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Spot Description"
								name="spot_description"
								multiline
								rows={3}
								value={formData.spot_description}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="Open Time"
								name="open_time"
								type="time"
								value={formData.open_time}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="Close Time"
								name="close_time"
								type="time"
								value={formData.close_time}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="Hourly Rate (₹)"
								name="hourly_rate"
								type="number"
								value={formData.hourly_rate}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="Total Slots"
								name="total_slots"
								type="number"
								value={formData.total_slots}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<Input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								inputProps={{
									multiple: true,
								}}
								sx={{ display: "none" }}
								id="image-upload"
							/>
							<Button
								variant="contained"
								fullWidth
								sx={{ mt: 3, mb: 2 }}
								color="primary"
								startIcon={<CloudUploadIcon />}
							>
								<InputLabel htmlFor="image-upload" sx={{ color: "white" }}>
									Upload Images
								</InputLabel>
							</Button>
						</Grid>
						{/* Image Previews */}
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
							{formData.image.map((image, index) => (
								<Box key={index} sx={{ position: "relative", width: 100, height: 100 }}>
									<img
										src={`data:image/*;base64,${image}`}
										alt={`Uploaded ${index}`}
										style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
									/>
									<IconButton
										onClick={() => handleDeleteImage(index)}
										sx={{
											position: "absolute",
											top: 0,
											right: 0,
											backgroundColor: "rgba(255, 255, 255, 0.8)",
										}}
									>
										<DeleteIcon color="error" />
									</IconButton>
								</Box>
							))}
						</Box>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelClick}>Cancel</Button>
					<Button onClick={handleConfirmClick}>Confirm</Button>
				</DialogActions>
			</Dialog>
			<ConfirmationDialogBox
				open={confirmationOpen}
				message={confirmationMessage}
				onConfirm={action == "Cancel" ? onCancelConfirmation : onConfirmConfirmation}
				onCancel={action == "Cancel" ? onCancelCancellation : onConfirmCancellation}
			/>
			<Snackbar
				open={openSnackbar.open}
				autoHideDuration={3000}
				onClose={() => setOpenSnackbar({ ...openSnackbar, open: false })}
			>
				<Alert severity={openSnackbar.severity} variant="filled">
					{openSnackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export { EditSpot };
