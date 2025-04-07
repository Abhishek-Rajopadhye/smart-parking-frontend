/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
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
    Dialog
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import axios from "axios";
import { BACKEND_URL } from "../const";
import { Booking } from "../pages/Booking";

const DetailInfo = ({ selectedMarker, user }) => {
    const [reviews, setReviews] = useState([]);
    const [ownerDetail, setOwnerDetail] = useState({});
    const [reviewImages, setReviewImages] = useState([]);
    const [spotImage,setSpotImage]=useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [reviewsRes, ownerRes] = await Promise.all([
                    axios.get(`${BACKEND_URL}/review/spot/${selectedMarker.spot_id}`),
                    axios.get(`${BACKEND_URL}/users/owner/${selectedMarker.owner_id}`)
                ]);
                setReviews(reviewsRes.data);
                
                // Extract images from reviews where image is not null
                const images = reviewsRes.data
                    .map(review => review.image)
                    .filter(img => img !== null && img !== ""); // Remove null/empty values
                setReviewImages(images);
                setOwnerDetail(ownerRes.data);       
                console.log("recie review ",reviewsRes.data);
                console.log("ll",ownerRes.data);
                console.log("Review iamges ",reviewImages.data)
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        const getImage = async () => {
            try {
             const response =await  axios.get(`${BACKEND_URL}/spotdetails/get-image/${selectedMarker.spot_id}`);
              if (response.status === 200) {
                const imageData = response.data.image; 
                setSpotImage(`data:image/png;base64,${imageData}`);
              }
            } catch (error) {
             console.error("error ",error)
            } 
            
        
          }
          if (selectedMarker.spot_id && selectedMarker.owner_id) {
            fetchDetails();
            getImage();
        }
    }, [selectedMarker.spot_id, selectedMarker.owner_id, reviewImages.data]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating_score, 0) / reviews.length
        : 0;


    const toggleDialogBooking = () => {
        setDialogBookingOpen(!dialogBookingOpen);
    }
console.log("ownerrimages ",ownerDetail.profile_picture);
    return (

        <Box sx={{ position: "relative", width: "95%", margin: "auto", padding: 3, top: 200 }}>
            <Paper sx={{ padding: 2, textAlign: "left" }}>
                <CardMedia
                    component="img"
                    height="300"
                    image={spotImage || "https://cdn.pixabay.com/photo/2020/05/31/09/12/park-5241887_1280.jpg"}
                    alt="Parking Spot"
                />
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, ml: 1 }}>
                    {selectedMarker.spot_title}
                </Typography>
            </Paper>

            <Grid container spacing={2} sx={{ marginTop: 1 }}>
                {/* Left Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={6} sx={{ padding: 3, height: "500px", overflow: "hidden" }}>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                            <Avatar alt="Owner" src={ownerDetail.profile_picture } sx={{ mr: 2, width: 56, height: 56 }} />
                            
                            <Typography variant="h5">{ownerDetail.name || "Unknown Owner"}</Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6">
                                <PhoneIcon sx={{ mr: 2 }} /> {ownerDetail.phone || "Contact not available"}
                            </Typography>
                            <Typography variant="h6" sx={{ ml: 6 }}>
                                {ownerDetail.email || "Email not provided"}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", mt: 2 }}>
                            <LocationOnIcon sx={{ mr: 2, color: "red" }} />
                            <Typography variant="h6" color="primary">
                                {selectedMarker.address}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                            <CurrencyRupeeIcon sx={{ mr: 2, color: "green" }} />
                            <Typography variant="h6">{selectedMarker.hourly_rate} (1 Hr)</Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                            <AccessTimeIcon sx={{ mr: 2 }} />
                            <Typography variant="h6">
                                {selectedMarker.open_time} to {selectedMarker.close_time}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", mt: 2 }}>
                            <CalendarTodayIcon sx={{ mr: 2 }} />
                            <Grid container spacing={1}>
                                {Array.isArray(selectedMarker.available_days) ? selectedMarker.available_days.map((day, index) => (
                                    <Grid item key={index}>
                                        <Chip label={day.slice(0, 3).toUpperCase()} color="primary" size="medium" />
                                    </Grid>
                                )) : <Typography variant="h6">No available days</Typography>}
                            </Grid>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                            <LocalParkingIcon sx={{ mr: 2 }} />
                            <Typography variant="h6">Available Slots: {selectedMarker.available_slots}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={6} sx={{ padding: 3, height: "500px", overflow: "hidden" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Rating name="read-only" value={averageRating} precision={0.5} readOnly />
                            <Typography>({reviews.length})</Typography>
                        </Box>

                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>Reviews</Typography>

                        {/*Scroble review*/}
                        {reviews.length===0 ? (
                            <Typography variant="h6" sx={{ mt: 2, color: "gray", textAlign: "center" }}>
                            No reviews available
                        </Typography>
                        ):( 

                        
                        <Box sx={{ height: "400px", overflowY: "auto", padding: 2 }}>
                            <Grid container direction="column" spacing={2}>
                                {reviews.map((review, index) => (
                                    <Grid item key={index} sx={{ bgcolor: "skyblue", borderRadius: 2, mt: 2, padding: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Avatar sx={{ bgcolor: "red", mr: 2 }}>{review.reviewer_name?.charAt(0) || "A"}</Avatar>
                                                <Typography variant="body1" fontWeight="bold">{review.reviewer_name || "Anonymous"}</Typography>
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>{review.created_at.slice(0, 10)}</Typography>

                                        </Box>
                                        <Box bgcolor="gray" sx={{ padding: 2, borderRadius: 4, mt: 1 }}>
                                            <Rating name="read-only" value={review.rating_score} readOnly />
                                            <Typography fontWeight="bold" >{review.review_description}</Typography>
                                            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2 }}>
                                                <Avatar alt="Owner" src={ownerDetail.profile_picture} sx={{ width: 24, height: 24, mr: 1 }} >{ownerDetail.name.slice(0,1)}</Avatar>
                                                <Typography color="white" variant="subtitle2">{review.owner_reply ? review.owner_reply : "No reply from owner"}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}

                            </Grid>
                        </Box>
                        )}

                    </Paper>
                </Grid>

                {/* Image Section */}
                <Box>
                    {itemData.length > 0 && (
                        <Box sx={{ mt: 3, padding: 3 }}>
                            <Typography variant="h4" fontWeight="bold">User Uploaded Images</Typography>
                            <ImageList cols={3} gap={8} sx={{ width: "100%", height: 170 }}>
                                {itemData.map((img, index) => (
                                    <ImageListItem key={index} onClick={() => setSelectedImage(img.img)}>
                                        <img
                                            src={img.img}
                                            alt={`Review ${index}`}
                                            loading="lazy"
                                            style={{ cursor: 'pointer' }} />

                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Box>
                    )}
                    {/* Image Enlargement Dialog */}
                    <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)}>
                        <img
                            src={selectedImage}
                            alt="Enlarged"
                            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
                        />
                    </Dialog>

                </Box>


            </Grid>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    sx={{ borderRadius: 2, mt: 2, fontSize: "large" }} onClick={toggleDialogBooking} >Book Now</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        navigate("/home");
                    }}
                    sx={{ borderRadius: 2, mt: 2, fontSize: "large" }}
                >Go Home</Button>
            </Box>
            <Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking}/>

        </Box>
    );
};

export default DetailInfo;


const itemData = [
    {
        img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
        title: 'Breakfast',
    },
    {
        img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
        title: 'Burger',
    },
    {
        img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
        title: 'Camera',
    }
    ,
    {
        img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
        title: 'Camera',
    }
    ,
    {
        img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
        title: 'Camera',
    }
    ,
    {
        img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
        title: 'Camera',
    }
];