import { Card, CardActions, CardContent, CardHeader, Typography, Button, Avatar, CardMedia, Box, Rating, Dialog } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ReviewCard = ({ review }) => {
	const [formattedDate, setFormattedDate] = useState("");
	const { user } = useContext(AuthContext);
	const [images, setImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	
	useEffect(() => {
		if (review.created_at) {
			const date = new Date(review.created_at);
			setFormattedDate(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
		}
		if(review.images && review.images.length > 0) {
			setImages(review.images.map((image) => `data:image/png;base64,${image}`));
		}
	}, [review]);

	return (
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
							padding:"5px",
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

			<CardActions>
				{user.id === review.spot_owner_id && <Button>Reply</Button>}
				{user.id === review.user_id && (
					<>
						<Button variant="outlined" color="primary">Edit</Button>
						<Button color="error">Delete</Button>
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
	);
};

export { ReviewCard };
