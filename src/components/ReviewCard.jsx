import {
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Typography,
	Button,
	Avatar,
	CardMedia,
	Box,
	Rating,
	Dialog,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ConfirmationDialogBox } from "./ConfirmationDialogBox";
import { EditReview } from "./EditReview";

const ReviewCard = ({ review, handleDeleteReview, handleEditReview }) => {
	const [formattedDate, setFormattedDate] = useState("");
	const { user } = useContext(AuthContext);
	const [images, setImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const [deleteConfirmationMessage, setDeleteConfirmationMessage] = useState(null);
	const [editReviewDialogOpen, setEditReviewDialogOpen] = useState(false);

	useEffect(() => {
		if (review.created_at) {
			const date = new Date(review.created_at);
			setFormattedDate(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
		}
		if (review.images && review.images.length > 0) {
			setImages(review.images.map((image) => `data:image/png;base64,${image}`));
		}
	}, [review]);

	const onDeleteClick = () => {
		setDeleteConfirmationMessage("Are you sure you want to delete this review?");
		setDeleteConfirmationOpen(true);
	};

	const onDeleteConfirmation = () => {
		setDeleteConfirmationOpen(false);
		setDeleteConfirmationMessage(null);
		handleDeleteReview();
	};

	return (
		<>
			<Card className="review-card">
				<CardHeader
					avatar={<Avatar alt={review.user_id} src={review.user_profile_picture} sx={{ width: 56, height: 56 }} />}
					title={
						<Typography variant="h6" component="div">
							{review.reviewer_name}
						</Typography>
					}
					subheader={formattedDate}
				/>
				<CardContent>
					<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
						<Rating name="read-only" value={review.rating_score} precision={0.5} readOnly />
						<Typography variant="body2" sx={{ ml: 1 }}>
							({review.rating_score})
						</Typography>
					</Box>
					<Typography>{review.review_description}</Typography>
				</CardContent>
				<Box sx={{ display: "flex", overflowX: "scroll" }}>
					{images &&
						images.length > 0 &&
						images.map((image, index) => (
							<CardMedia
								key={index}
								component="img"
								image={image}
								alt={`Review Image ${index}`}
								sx={{
									width: 64,
									height: 64,
									objectFit: "cover",
									borderRadius: 2,
									margin: "10px",
									padding: "5px",
									cursor: "pointer",
									"&:hover": {
										opacity: 0.8,
										transform: "scale(1.05)",
										transition: "transform 0.2s",
									},
								}}
								onClick={() => setSelectedImage(image)}
							/>
						))}
				</Box>
				<CardActions>
					{user.id === review.spot_owner_id && <Button>Reply</Button>}
					{user.id === review.user_id && (
						<>
							<Button
								variant="outlined"
								color="primary"
								onClick={() => {
									setEditReviewDialogOpen(true);
								}}
							>
								Edit
							</Button>
							<Button color="error" onClick={onDeleteClick}>
								Delete
							</Button>
						</>
					)}
				</CardActions>
				<Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)}>
					<CardMedia
						component="img"
						image={selectedImage}
						sx={{
							objectFit: "cover",
							borderRadius: 2,
							margin: "3px",
						}}
					/>
				</Dialog>
			</Card>
			<ConfirmationDialogBox
				open={deleteConfirmationOpen}
				message={deleteConfirmationMessage}
				onConfirm={() => {
					onDeleteConfirmation();
				}}
				onCancel={() => {
					setDeleteConfirmationOpen(false);
				}}
			/>
			<EditReview
				openDialog={editReviewDialogOpen}
				onClose={() => {
					setEditReviewDialogOpen(false);
				}}
				review={review}
				handleSave={(editedReview) => handleEditReview(editedReview)}
			/>
		</>
	);
};

export { ReviewCard };
