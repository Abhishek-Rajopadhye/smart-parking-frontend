import { Card, CardActions, CardContent, Typography, Button, Avatar, CardMedia } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ReviewCard = ({ review }) => {
	const [formattedDate, setFormattedDate] = useState("");
	const { user } = useContext(AuthContext);

	useEffect(() => {
		if (review.created_at) {
			const date = new Date(review.created_at);
			setFormattedDate(date.toLocaleString("en-US", { timeZone: "IST" }));
		}
	}, [review.created_at]);

	return (
		<Card className="review-card">
			<CardHeader
				avatar={<Avatar alt={review.user_id} src={review.user_profile_picture} sx={{ width: 56, height: 56 }} />}
				title={
					<Typography variant="h6" component="div">
						{review.user_name}
					</Typography>
				}
				subheader={formattedDate}
			/>
			<CardContent>
				<Typography>Rating: {review.rating_score}</Typography>
				<Typography>{review.review_description}</Typography>
			</CardContent>
			<CardActions>
				{user.id === review.spot_owner_id && <Button>Reply</Button>}
				{user.id === review.user_id && (
					<>
						<Button>Edit</Button>
						<Button>Delete</Button>
					</>
				)}
			</CardActions>
			{review.images &&
				review.images.length > 0 &&
				review.images.map((image, index) => (
					<CardMedia
						key={index}
						component="img"
						height="140"
						image={image} // Display the first image
						alt="Review Image"
					/>
				))}
		</Card>
	);
};

export { ReviewCard };
