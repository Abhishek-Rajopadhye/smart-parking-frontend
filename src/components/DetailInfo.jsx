import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Paper,
  Typography,
  Chip,
  Box,
  Rating,
  Avatar,
  CardMedia,
  Button,
  ImageList,
  ImageListItem,
  Dialog,
  IconButton,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useRef } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import axios from "axios";
import { BACKEND_URL } from "../const";
import { Booking } from "../pages/Booking";
import { ReviewCard } from "./ReviewCard";
import { AddReview } from "./AddReview";

// Top imports remain the same...

const DetailInfo = () => {
  const { spot_id } = useParams();
  const [selectedMarker, setSelectedMarker] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ownerDetail, setOwnerDetail] = useState({});
  const [spotImages, setSpotImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
  const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/spotdetails/get-spot/${spot_id}`)
      .then((res) => res.json())
      .then((data) => setSelectedMarker(data))
      .catch((err) => console.error("Error:", err));
  }, [spot_id]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [reviewsRes, ownerRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/reviews/spot/${selectedMarker.spot_id}`),
          axios.get(`${BACKEND_URL}/users/owner/${selectedMarker.owner_id}`),
        ]);
        setReviews(reviewsRes.data);
        setOwnerDetail(ownerRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    const getImages = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/spotdetails/get-images/${selectedMarker.spot_id}`
        );
        setSpotImages(data.images.map((b64) => `data:image/png;base64,${b64}`));
      } catch (err) {
        console.error("Image Error:", err);
      }
    };

    if (selectedMarker.spot_id && selectedMarker.owner_id) {
      fetchDetails();
      getImages();
    }
  }, [selectedMarker.spot_id, selectedMarker.owner_id]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating_score, 0) /
        reviews.length
      : 0;

  const toggleDialogBooking = () => setDialogBookingOpen(!dialogBookingOpen);

  const handleAddReviewClose = async () => {
    const res = await axios.get(
      `${BACKEND_URL}/reviews/spot/${selectedMarker.spot_id}`
    );
    if (res.status === 200) setReviews(res.data);
    setAddReviewDialogOpen(false);
  };

  const scrollRef = useRef();

  const scroll = (direction) => {
    const { current } = scrollRef;
    const scrollAmount = 300;
    if (current) {
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? spotImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === spotImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: "100%", sm: 600, md: 700 },
        margin: "auto",
        padding: { xs: 1, sm: 2 },
      }}
    >
      {/* Spot Images */}
      {spotImages.length > 0 && (
        <>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 2,
              textAlign: "center",
              fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" },
            }}
          >
            Spot Details
          </Typography>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: 200, sm: 300 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
            }}
          >
            {/* Left Arrow */}
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 10,
                zIndex: 1,
                backgroundColor: "rgba(255,255,255,0.7)",
                "&:hover": { backgroundColor: "white" },
              }}
            >
              <ArrowBackIos />
            </IconButton>

            {/* Current Image */}
            <Box
              component="img"
              src={spotImages[currentImageIndex]}
              alt={`Spot ${currentImageIndex}`}
              onClick={() => setSelectedImage(spotImages[currentImageIndex])}
              sx={{
                maxHeight: { xs: 180, sm: 250 },
                maxWidth: { xs: "90%", sm: "80%", md: "60%" },
                objectFit: "cover",
                borderRadius: 2,
                boxShadow: 3,
                cursor: "pointer",
              }}
            />

            {/* Right Arrow */}
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 10,
                zIndex: 1,
                backgroundColor: "rgba(255,255,255,0.7)",
                "&:hover": { backgroundColor: "white" },
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          </Box>
        </>
      )}

      {/* Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "transparent",
            boxShadow: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 1, sm: 2 },
          },
        }}
      >
        <Box
          component="img"
          src={selectedImage}
          alt="Enlarged"
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: 2,
            boxShadow: 3,
          }}
        />
      </Dialog>

      {/* Spot Info */}
      <Paper
        elevation={4}
        sx={{
          padding: { xs: 2, sm: 3 },
          backgroundColor: "#f9f9ff",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          textAlign="center"
          fontWeight="bold"
          color="primary"
          mb={2}
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          {selectedMarker.spot_title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            mb: 2,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {/* <Avatar
            src={ownerDetail.profile_picture}
            sx={{ mr: { sm: 2 }, mb: { xs: 1, sm: 0 }, width: 56, height: 56 }}
          /> */}
          <Box>
            <Typography variant="h6">
              Owner: {ownerDetail.name || "Unknown Owner"}
            </Typography>
            <Typography variant="body2">Contact: {ownerDetail.email}</Typography>
            <Typography variant="body2">{ownerDetail.phone}</Typography>
          </Box>
        </Box>

        <Typography variant="body1" mb={1}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "red" }} />
          {selectedMarker.address}
        </Typography>

        <Typography variant="body1" mb={1}>
          <CurrencyRupeeIcon fontSize="small" sx={{ mr: 1, color: "green" }} />
          {selectedMarker.hourly_rate} / hour
        </Typography>

        <Typography variant="body1" mb={1}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          {selectedMarker.open_time} - {selectedMarker.close_time}
        </Typography>

        <Box mb={1} sx={{ display: "flex", flexWrap: "wrap" }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          {Array.isArray(selectedMarker.available_days) ? (
            selectedMarker.available_days.map((day, i) => (
              <Chip
                key={i}
                label={day.slice(0, 3).toUpperCase()}
                size="small"
                color="info"
                sx={{ mx: 0.5, my: 0.5 }}
              />
            ))
          ) : (
            <Typography>No Available Days</Typography>
          )}
        </Box>

        <Typography variant="body1" mb={2}>
          <LocalParkingIcon fontSize="small" sx={{ mr: 1 }} />
          Available Slots: {selectedMarker.available_slots}
        </Typography>

        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={toggleDialogBooking}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Book Now
        </Button>
      </Paper>

      {/* Reviews */}
      <Paper
        elevation={3}
        sx={{
          padding: { xs: 2, sm: 3 },
          mt: 4,
          backgroundColor: "#fff3e0",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Reviews
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Rating value={averageRating} precision={0.5} readOnly />
          <Typography>({reviews.length})</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setAddReviewDialogOpen(true)}
          >
            Add Review
          </Button>
        </Box>

        <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
          {reviews.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              No reviews yet.
            </Typography>
          ) : (
            reviews.map((review, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <ReviewCard review={review} />
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* Navigation */}
      <Box textAlign="center" mt={4}>
        <Button variant="outlined" onClick={() => navigate("/homepage")}>
          Back to Home
        </Button>
      </Box>

      {/* Dialogs */}
      <Booking
        open={dialogBookingOpen}
        spot_information={selectedMarker}
        set_dialog={toggleDialogBooking}
      />
      <AddReview
        openDialog={addReviewDialogOpen}
        onClose={handleAddReviewClose}
        spot_id={selectedMarker.spot_id}
      />
    </Box>
  );
};

export default DetailInfo;
