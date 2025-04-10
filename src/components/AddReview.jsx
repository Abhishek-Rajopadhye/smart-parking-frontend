import {
	Box,
	Grid,
	Button,
	Snackbar,
	Dialog,
	DialogContent,
	DialogTitle,
	Rating,
	TextField,
	Typography,
	Alert,
	Input,
	InputLabel,
	DialogActions,
	IconButton,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { BACKEND_URL } from "../const";
import axios from "axios";

/**
 * AddReview component for submitting a review for a parking spot.
 *
 * Allows users to add a review with a description, rating, and multiple images.
 * Displays a confirmation message upon successful submission or an error message if the submission fails.
 *
 * @component
 * @returns {JSX.Element} The AddReview component.
 */
const AddReview = ({ openDialog, onClose, spot_id }) => {
	const [formData, setFormData] = useState({
		id: null,
		user_id: -1,
		spot_id: spot_id,
		review_description: "",
		rating_score: 0,
		images: [], // Array to store multiple images
		owner_reply: null,
		created_at: null,
	});
	const { user } = useContext(AuthContext);
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	/**
	 * Initializes the form data with the logged-in user's ID.
	 */
	useEffect(() => {
		setFormData({
			id: null,
			user_id: user.id,
			spot_id: spot_id,
			review_description: "",
			rating_score: 0,
			images: [],
			owner_reply: null,
			created_at: null,
		});
	}, [setFormData, spot_id, user]);

	/**
	 * Handles the submission of the review form.
	 *
	 * Sends the review data to the backend API and displays a success or error message.
	 *
	 * @param {Object} event - The form submission event.
	 */
	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			setFormData((prevData) => ({
				...prevData,
				["created_at"]: new Date().toISOString(),
			}));
			const response = await axios.post(`${BACKEND_URL}/reviews/`, formData, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (response.status !== 200) {
				throw new Error("Failed to add review");
			}

			setOpenSnackbar({
				open: true,
				message: "Review added successfully!",
				severity: "success",
			});
		} catch (error) {
			console.error("Error adding review:", error);
			setOpenSnackbar({
				open: true,
				message: error.message,
				severity: "error",
			});
		}
	};

	/**
	 * Handles changes to form input fields.
	 *
	 * Updates the form data state with the new values.
	 *
	 * @param {Object} event - The input change event.
	 */
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({
			...prevData,
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
					images: [...prevData.images, reader.result.split(",")[1]], // Add image to the array
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
			images: prevData.images.filter((_, i) => i !== index),
		}));
	};

	return (
		<>
			<Dialog component="form" open={openDialog} onSubmit={handleSubmit}>
				<DialogTitle>Add Review</DialogTitle>
				<DialogContent>
					<Box>
						<Typography>Enter a Rating Score</Typography>
						<Rating name="rating_score" value={formData.rating_score} onChange={handleChange} />
						<TextField
							fullWidth
							type="text"
							label="Review"
							name="review_description"
							placeholder="Write your review here..."
							multiline
							rows={3}
							value={formData.review_description}
							onChange={handleChange}
						/>
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
							{formData.images.map((image, index) => (
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
					</Box>
				</DialogContent>
				<DialogActions>
					<Button color="error" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" color="primary">
						Submit Review
					</Button>
				</DialogActions>
			</Dialog>
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

export { AddReview };
