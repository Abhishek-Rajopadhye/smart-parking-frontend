import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
	Snackbar,
	TextField,
	Alert,
} from "@mui/material";
import { ConfirmationDialogBox } from "./ConfirmationDialogBox";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";

// Top imports remain the same...

const DetailInfo = () => {
	const { spot_id } = useParams();
	const [msg, setMsg] = useState("");
	const [selectedMarker, setSelectedMarker] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [ownerDetail, setOwnerDetail] = useState({});
	const [spotImages, setSpotImages] = useState([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [selectedImage, setSelectedImage] = useState(null);
	const [dialogBookingOpen, setDialogBookingOpen] = useState(false);
	const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false);
	const navigate = useNavigate();

	/*
  My Code
  */
	const spot_information = selectedMarker;
	console.log(spot_information);
	const { user } = useContext(AuthContext);
	const [razorpay_signature, setRazorpaySignature] = useState(null);
	const [razorpay_order_id, setRazorpayOrderId] = useState(null);
	const [totalSlots, setTotalSlots] = useState(1);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [totalAmount, setTotalAmount] = useState(null);
	const [ratePerHour, setRatePerHour] = useState(spot_information.hourly_rate);
	const [openDialog, setOpenDialog] = useState(false);
	const [prevTotalSlots, setPrevTotalSlots] = useState(0);
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState(false);
	const [indianStartTime, setIndianStartTime] = useState(null);
	const [indianEndTime, setIndianEndTime] = useState(null);
	const [flag, setFlag] = useState(false);
	const [buttonDisabled, setButtonDisabled] = useState(false);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0, 0, 0, 0);
	const showSnackbar = (message, severity = "info") => {
		setOpenSnackbar({ open: true, message, severity });
	};

	/*
	 */
	useEffect(() => {
		fetch(`${BACKEND_URL}/spotdetails/get-spot/${spot_id}`)
			.then((res) => res.json())
			.then((data) => {
				setSelectedMarker(data);
			})
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
				const { data } = await axios.get(`${BACKEND_URL}/spotdetails/get-images/${selectedMarker.spot_id}`);
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
		reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating_score, 0) / reviews.length : 0;

	const handleAddReviewClose = async () => {
		const res = await axios.get(`${BACKEND_URL}/reviews/spot/${selectedMarker.spot_id}`);
		if (res.status === 200) setReviews(res.data);
		setAddReviewDialogOpen(false);
	};

	const scrollRef = useRef();

	// eslint-disable-next-line no-unused-vars
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
		setCurrentImageIndex((prev) => (prev === 0 ? spotImages.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentImageIndex((prev) => (prev === spotImages.length - 1 ? 0 : prev + 1));
	};

	const toggleDialogBooking = () => {
		setDialogBookingOpen(!dialogBookingOpen);
	};

	/*
  My Code
  */

	/**
	 * This function is used to validate the date and time
	 * It will check the selected date is future date or not
	 * It will check the selected day is available day or not
	 * It will check the selected time is between open time and close time
	 * It will check the selected time is between open time and close time
	 *
	 * @param {*} selectedDate
	 * @param {*} msg
	 * @returns boolean
	 */
	const validateDateTime = (selectedDate, msg) => {
		const isoString = selectedDate.toLocaleString("en-IN", {
			timeZone: "Asia/Kolkata",
		});
		const dateParts = isoString.split(",")[0].split("/");
		const timeParts = isoString.split(",")[1].trim().split(":");
		let hours = parseInt(timeParts[0]);
		const minutes = parseInt(timeParts[1]);
		const period = timeParts[2].split(" ")[1];

		if (period === "pm" && hours !== 12) hours += 12;
		if (period === "am" && hours === 12) hours = 0;

		let [openTimeHour, openTimeMin] = spot_information.open_time.split(" ")[0].split(":");
		let [closeTimeHour, closeTimeMin] = spot_information.close_time.split(" ")[0].split(":");
		openTimeHour = parseInt(openTimeHour);
		openTimeMin = parseInt(openTimeMin);
		closeTimeHour = parseInt(closeTimeHour);
		closeTimeMin = parseInt(closeTimeMin);

		if (
			hours < openTimeHour ||
			hours > closeTimeHour ||
			(hours === openTimeHour && minutes < openTimeMin) ||
			(hours === closeTimeHour && minutes > closeTimeMin)
		) {
			showSnackbar(`Slot not available.`, "warning");
			return false;
		}
		if (msg == "start") {
			console.log("Start", isoString);
			setIndianStartTime(isoString);
		} else {
			console.log("End", isoString);
			setIndianEndTime(isoString);
		}
		return true;
	};
	/**
	 *  This function is used to convert the date and time to string
	 * @param {*} date
	 * @returns
	 */
	const dateTimeToString = (date) => {
		return date.toISOString().replace("T", " ").slice(0, 19);
	};

	/**
	 * This function is used to download the pdf file
	 * @returns
	 */
    const downloadPDF = useCallback(async () => {
        const doc = new jsPDF();
        const primaryColor = "#007bff";
        const lightGray = "#f2f2f2";
        const darkGray = "#333";
        const currentDate = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });

        // Header with colored background
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 210, 30, "F"); // Full-width colored header

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Smart Parking", 105, 12, null, null, "center");

        doc.setFontSize(13);
        doc.setFont("helvetica", "italic");
        doc.text("Parking Booking Receipt", 105, 22, null, null, "center");

        doc.setFont("helvetica", "normal");
        doc.setTextColor(255);
        doc.text(`Date: ${currentDate}`, 190, 10, { align: "right" });

        let y = 40;
        const lineHeight = 10;

        // Helper: Draw colored section title
        const drawSectionTitle = (title, yPos) => {
            doc.setFillColor("#E9DFC3");
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.rect(20, yPos - 6, 170, 10, "F");
            doc.text(title, 25, yPos + 1);
            return yPos + 10;
        };

        const drawTable = (headers, dataRows, startY) => {
            // Header
            doc.setFillColor(lightGray);
            doc.setTextColor(darkGray);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.rect(20, startY, 170, lineHeight, "F");
            headers.forEach((header, i) => {
                doc.text(header, 25 + i * 85, startY + 6);
            });

            startY += lineHeight;

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);

            dataRows.forEach((row) => {
                const cell1 = String(row[0]);
                const cell2Lines = doc.splitTextToSize(String(row[1]), 80); // Wrap to 80 width
                const cellHeight = cell2Lines.length * 8; // Dynamic height based on lines

                doc.text(cell1, 25, startY + 6);
                doc.text(cell2Lines, 110, startY + 6); // Adjust column position for second column

                doc.rect(20, startY, 170, cellHeight); // Border
                startY += cellHeight;
            });

            return startY + 10;
        };

        y = drawSectionTitle("Booking Information", y);
        y = drawTable(
            ["Details", "Value"],
            [
                ["Spot Name", spot_information.spot_title],
                ["Address", ["Address", doc.splitTextToSize(spot_information.address, 80)]],
                ["Total Slots", totalSlots],
            ],
            y
        );

        y = drawSectionTitle("Payment Details", y);
        y = drawTable(
            ["Details", "Value"],
            [
                ["Order ID", paymentDetails.order_id],
                ["Payment ID", paymentDetails.payment_id],
                ["Amount Paid", `${paymentDetails.amount}`],
            ],
            y
        );

        y = drawSectionTitle("Timing", y);
        y = drawTable(
            ["Details", "Value"],
            [
                ["Start Time", indianStartTime],
                ["End Time", indianEndTime],
            ],
            y
        );

        const hourlyRate = ratePerHour;
        y = drawSectionTitle("Charges Breakdown", y);
        y = drawTable(
            ["Description", "Amount"],
            [
                [`${hourlyRate}/hr x ${Math.ceil(totalAmount / ratePerHour)} hrs`, totalAmount],
                ["Total Amount", totalAmount],
            ],
            y
        );

        // Rules Section
        y = drawSectionTitle("Important Rules & Policies", y);
        doc.setTextColor(50);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const rules = [
            "1. Cancellations not allowed after start time.",
            "2. Arrive 5 minutes early to avoid delays.",
            "3. Vehicles left beyond booking may incur fees.",
        ];

        rules.forEach((rule) => {
            doc.rect(20, y, 170, 6);
            doc.text(rule, 25, y + 4);
            y += 8;
        });

        // Footer
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.setFontSize(11);
        doc.text("Thank you for using Smart Parking!", 105, y, null, null, "center");

        doc.save("booking_receipt.pdf");

        const pdfBlob = doc.output("blob");

        const formData = new FormData();
        const userEmail = user.email;
        formData.append("file", pdfBlob, "booking_receipt.pdf");
        formData.append("email", userEmail);
        try {
            const res = await fetch(`${BACKEND_URL}/send-pdf/send-receipt-with-pdf`, {
                method: "POST",
                body: formData,
            });
            const result = await res.json();
            if (result.error) {
                showSnackbar("Failed to send receipt to email", "error");
            }
        } catch (err) {
            showSnackbar("Fail to Send Receipt to mail", "error");
        }
        setButtonDisabled(true);
	}, [
		indianEndTime,
		indianStartTime,
		paymentDetails,
		ratePerHour,
		showSnackbar,
		spot_information,
		totalAmount,
		totalSlots,
		user.email,
	]);

	useEffect(() => {
		if (paymentStatus) {
			downloadPDF();
			setEndTime("");
			setStartTime("");
			setTotalSlots(0);
			setFlag(false);
			setPaymentStatus(false);
			showSnackbar(
				"Booking successfully and Receipt sent to your register email and redirect to booking history!",
				"success"
			);
			setTimeout(() => {
				navigate("/booking-history");
			}, 3000);
		}
	}, [paymentStatus, navigate, downloadPDF]);

	/**
	 * This function is used to calculate the amount of the parking slot
	 * It will check the start time and end time and calculate the amount
	 * If the start time is greater than end time then it will show the error message
	 * If the total slot is less than 0 then it will show the error message
	 * If the start time and end time is not selected then it will show the error message
	 *
	 * @returns boolean
	 */
	const calculateAmount = () => {
		if (paymentStatus) {
			return;
		}
		setRatePerHour(spot_information.hourly_rate);
		if (!startTime || !endTime) {
			showSnackbar("Please select start and end time.", "warning");
			return false;
		}

		if (totalSlots <= 0) {
			showSnackbar("Total slot can not be negative", "warning");
			return false;
		}
		if (!validateDateTime(startTime, "start") || !validateDateTime(endTime, "end")) {
			return false;
		}

		const start = new Date(startTime);
		const end = new Date(endTime);
		const diffInMs = end - start;
		let hours = Math.ceil(diffInMs / (1000 * 60 * 60));
		console.log(hours);
		if (hours <= 0) {
			showSnackbar("Enter a valid time.", "error");
			return false;
		}

		setTotalAmount(hours * spot_information.hourly_rate * totalSlots);
		//setOpenDialog(true);
		const t = `You have to pay ₹${hours * spot_information.hourly_rate * totalSlots}. Are you sure you want to proceed?`;
		console.log(totalAmount);
		console.log(t);
		setMsg(t);
		toggleDialogBooking();
		return true;
	};

	/**
	 * This function is used to load the razorpay sdk
	 * @returns
	 */
	const loadRazorpay = async () => {
		return new Promise((resolve) => {
			if (window.Razorpay) {
				resolve(true);
				return;
			}
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	/**
	 * Function is used to process the payment and create the order
	 * If the payment is successful then it will update the payment status and also available slots
	 * If the payment is failed then it will show the error message
	 * @returns
	 */
	const processPayment = async () => {
		if (paymentStatus) return;
		let orderResponse;
		try {
			const razorpayLoaded = await loadRazorpay();
			if (!razorpayLoaded) {
				showSnackbar("Failed to load Razorpay SDK.", "error");
				return;
			}
			if (flag) {
				const response = await axios.put(`${BACKEND_URL}/bookings/update-booking-slots`, {
					spot_id: spot_information.spot_id,
					total_slots: prevTotalSlots,
				});
				setPrevTotalSlots(0);
				setFlag(false);
			}
			const start_time = dateTimeToString(startTime);
			const end_time = dateTimeToString(endTime);
			setRazorpaySignature(null);
			setRazorpayOrderId(null);
			setPrevTotalSlots(totalSlots);
			orderResponse = await axios.post(`${BACKEND_URL}/bookings/book-spot`, {
				user_id: user.id.toString(),
				spot_id: spot_information.spot_id,
				total_slots: totalSlots,
				total_amount: totalAmount,
				start_date_time: indianStartTime,
				end_date_time: indianEndTime,
				receipt: `booking_${Date.now()}`,
			});
			if (orderResponse.status !== 200) {
				showSnackbar(orderResponse.data.detail, "error");
				return;
			}
			const orderData = orderResponse.data;
			if (!orderData.order_id) {
				showSnackbar(orderResponse.data.detail, "error");
				return;
			}
			setRazorpayOrderId(orderData.order_id);
			setFlag(true);
			const options = {
				key: "rzp_test_82K1eUDvrHocUu",
				amount: orderData.amount,
				currency: orderData.currency,
				name: "Parking Service",
				description: `Booking for ${totalSlots} slot(s)`,
				order_id: orderData.order_id,
				handler: async function (response) {
					setPaymentDetails({
						name: spot_information.spot_title,
						description: `Booking for ${totalSlots} slot(s)`,
						order_id: response.razorpay_order_id,
						payment_id: response.razorpay_payment_id,
						signature: response.razorpay_signature,
						amount: totalAmount,
						start_time,
						end_time,
					});

					try {
						setRazorpaySignature(response.razorpay_signature);
						const check_payment = await axios.post(`${BACKEND_URL}/bookings/update-payment-status`, {
							start_time: indianStartTime,
							end_time: indianEndTime,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							payment_id: orderData.payment_id,
							total_slots: totalSlots,
						});
						if (check_payment.status === 200) {
							setPaymentStatus(true);
						}
					} catch (error) {
						if (error.response) {
							const errorMsg = error.response.data?.detail || "Payment failed.";
							showSnackbar("Booking failed We're refunding your payment", "error");
						} else {
							showSnackbar("Booking failed We're refunding your payment", "error");
						}
					}
				},
				theme: { color: "#4F46E5" },
			};

			const rzp1 = new window.Razorpay(options);
			rzp1.open();
		} catch (error) {
			if (error.response) {
				showSnackbar("No Slots Available", "error");
			} else if (error.request) {
				showSnackbar("No response from server. Please check your connection.", "error");
			} else {
				showSnackbar("An unexpected error occurred.", "error");
			}
		}
	};

	const handleCancel = async () => {
		try {
			if (flag && totalSlots != 0 && razorpay_order_id != null) {
				const response = await axios.put(`${BACKEND_URL}/bookings/update-booking-slots`, {
					spot_id: spot_information.spot_id,
					total_slots: totalSlots,
				});
				setTotalSlots(0);
				setStartTime(null);
				setEndTime(null);
				setFlag(false);
			}
			toggleDialogBooking();
		} catch (error) {
			console.error("Error:", error);
			// showSnackbar("Failed to cancel booking", "error");
		}
		toggleDialogBooking();
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
					<Box>
						<Typography variant="h6">Owner: {ownerDetail.name || "Unknown Owner"}</Typography>
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
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Total Slots"
								type="number"
								value={totalSlots}
								onChange={(e) => setTotalSlots(Number(e.target.value))}
							/>
						</Grid>

						<Grid item xs={12}>
							<DateTimePicker
								label="Start Time"
								value={startTime}
								onChange={setStartTime}
								minDateTime={new Date()}
								shouldDisableDate={(date) => {
									const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
									return !spot_information.available_days.includes(days[date.getDay()]);
								}}
								slotProps={{
									textField: {
										fullWidth: true,
										variant: "outlined",
									},
								}}
							/>
						</Grid>

						<Grid item xs={12}>
							<DateTimePicker
								label="End Time"
								value={endTime}
								onChange={setEndTime}
								minDateTime={new Date()}
								shouldDisableDate={(date) => {
									const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
									return !spot_information.available_days.includes(days[date.getDay()]);
								}}
								slotProps={{
									textField: {
										fullWidth: true,
										variant: "outlined",
									},
								}}
							/>
						</Grid>
					</Grid>
				</LocalizationProvider>
				<Button
					variant="contained"
					color="success"
					fullWidth
					size="large"
					onClick={calculateAmount}
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
					<Button size="small" variant="outlined" onClick={() => setAddReviewDialogOpen(true)}>
						Add Review
					</Button>
				</Box>

				<Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
					{reviews.length === 0 ? (
						<Typography variant="body1" color="text.secondary" textAlign="center">
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
			{/* <Booking open={dialogBookingOpen} spot_information={selectedMarker} set_dialog={toggleDialogBooking} /> */}
			<AddReview openDialog={addReviewDialogOpen} onClose={handleAddReviewClose} spot_id={selectedMarker.spot_id} />
			<Snackbar
				open={openSnackbar.open}
				autoHideDuration={3000}
				onClose={() => setOpenSnackbar({ ...openSnackbar, open: false })}
			>
				<Alert severity={openSnackbar.severity} variant="filled">
					{openSnackbar.message}
				</Alert>
			</Snackbar>
			<ConfirmationDialogBox
				open={dialogBookingOpen}
				message={msg}
				onConfirm={processPayment}
				onCancel={handleCancel}
			></ConfirmationDialogBox>
		</Box>
	);
};

export default DetailInfo;
