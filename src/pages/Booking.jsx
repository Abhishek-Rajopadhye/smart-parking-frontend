/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
	Box,
	Grid,
	Button,
	Typography,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Snackbar,
	Alert,
	IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../style/booking.css";

//spot_information is object which hold the all information
const Booking = ({ spot_information, user_id }) => {
	const navigate = useNavigate();
	const [totalSlots, setTotalSlots] = useState(1);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [totalAmount, setTotalAmount] = useState(null);
	const [ratePerHour] = useState(spot_information.hourly_rate);
	const [openDialog, setOpenDialog] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState({ open: false, message: "", severity: "info" });
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState(false);
	const [indianStartTime, setIndianStartTime] = useState(null);
	const [indianEndTime, setIndianEndTime] = useState(null);
	const showSnackbar = (message, severity = "info") => {
		setOpenSnackbar({ open: true, message, severity });
	};

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
		if (!selectedDate || new Date(selectedDate).getTime() <= new Date().getTime()) {
			showSnackbar("Please select a future date and time.", "error");
			return false;
		}
		const openDay = new Date(selectedDate).toDateString().split(" ")[0];

		if (!spot_information.available_days.includes(openDay)) {
			showSnackbar(`Spot is closed on ${openDay}.`, "warning");
			return false;
		}

		const isoString = selectedDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }); //
		console.log(isoString);
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

		if (hours < openTimeHour || hours > closeTimeHour) {
			showSnackbar(`Spot is open from ${spot_information.open_time} to ${spot_information.close_time}.`, "warning");
			return false;
		}

		if (hours === openTimeHour && minutes < openTimeMin) {
			showSnackbar(`Spot is open from ${spot_information.open_time} to ${spot_information.close_time}.`, "warning");
			return false;
		}

		if (hours === closeTimeHour && minutes > closeTimeMin) {
			showSnackbar(`Spot is open from ${spot_information.open_time} to ${spot_information.close_time}.`, "warning");
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

	useEffect(() => {
		if (paymentStatus) {
			navigate("/booking");
		}
	}, [paymentStatus, navigate]);

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
		if (!startTime || !endTime) {
			showSnackbar("Please select start and end time.", "warning");
			return false;
		}

		if (totalSlots <= 0) {
			showSnackbar("Total Slot should be greater than zero.", "warning");
			return false;
		}
		console.log(startTime, endTime);
		if (!validateDateTime(startTime, "start") || !validateDateTime(endTime, "end")) {
			return false;
		}

		const start = new Date(startTime);
		const end = new Date(endTime);
		const diffInMs = end - start;
		let hours = Math.ceil(diffInMs / (1000 * 60 * 60));

		if (hours <= 0) {
			showSnackbar("End time must be after start time.", "error");
			return false;
		}

		setTotalAmount(hours * ratePerHour * totalSlots);
		setOpenDialog(true);
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
	 * This function is used to process the payment
	 * It will check the payment status if it is true then it will return
	 * It will check the spot information available slot is less than total slot then it will show the error message
	 * It will check the start time and end time is selected or not
	 * @returns
	 */
	const processPayment = async () => {
		if (paymentStatus) {
			return;
		}
		let orderResponse;
		try {
			const razorpayLoaded = await loadRazorpay();
			if (!razorpayLoaded) {
				showSnackbar("Failed to load Razorpay SDK.", "error");
				return;
			}
			console.log(startTime);
			const start_time = dateTimeToString(startTime);
			const end_time = dateTimeToString(endTime);

			if (spot_information.available_slots < totalSlots) {
				showSnackbar("No Slots availables", "error");
				return;
			}
			orderResponse = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/bookings/book-spot`, {
				user_id: user_id.toString(),
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

			const options = {
				key: "rzp_test_JcFPR4o6XJnTf8",
				amount: orderData.amount,
				currency: orderData.currency,
				name: "Parking Service",
				description: `Booking for ${totalSlots} slot(s)`,
				order_id: orderData.order_id,
				handler: function (response) {
					setPaymentDetails({
						name: spot_information.spot_title,
						description: `Booking for ${totalSlots} slot(s)`,
						order_id: response.razorpay_order_id,
						payment_id: response.razorpay_payment_id,
						amount: totalAmount,
						start_time,
						end_time,
					});
					setPaymentStatus(true);
					showSnackbar("Booking Successful!", "success");
				},
				theme: { color: "#4F46E5" },
			};

			const rzp1 = new window.Razorpay(options);
			rzp1.open();
		} catch (error) {
			console.log("Booking failed:", error);
			if (error.response) {
				showSnackbar("No Slots Available", "error");
			} else if (error.request) {
				showSnackbar("No response from server. Please check your connection.", "error");
			} else {
				showSnackbar("An unexpected error occurred.", "error");
			}
		}
	};

	/**
	 * This function is used to download the pdf file
	 * @returns
	 */
	const downloadPDF = () => {
		if (!paymentDetails) {
			return;
		}

		const doc = new jsPDF();
		doc.setFontSize(18);
		doc.text("Parking Booking Receipt", 70, 20);

		doc.setFontSize(12);
		doc.text(`Spot Name: ${spot_information.spot_title}`, 20, 40);
		doc.text(`Spot Address: ${spot_information.address}`, 20, 50);
		doc.text(`Total Slots: ${totalSlots}`, 20, 60);
		doc.text(`Order ID: ${paymentDetails.order_id}`, 20, 70);
		doc.text(`Payment ID: ${paymentDetails.payment_id}`, 20, 80);
		doc.text(`Total Amount: ₹${paymentDetails.amount}`, 20, 90);
		doc.text(`Start Time: ${indianStartTime}`, 20, 100);
		doc.text(`End Time: ${indianEndTime}`, 20, 110);

		doc.save("booking_receipt.pdf");
	};

	return (
		<Dialog open={true}>
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Box className="form-container">
				<Box className="form-container">
					{/* Circular Button to Go Back */}
					<IconButton
						onClick={() => navigate(-1)}
						sx={{
							position: "relative",
							bottom: "20%",
							right: "5%",
							backgroundColor: "white",
							border: "1px solid gray",
							"&:hover": { backgroundColor: "lightgray" },
						}}
					>
						<ArrowBackIcon />
					</IconButton>
					<Box className="form-box">
						<Typography variant="h5" gutterBottom align="center">
							Book Your Parking Spot
						</Typography>

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
									renderInput={(params) => <TextField {...params} fullWidth />}
								/>
							</Grid>

							<Grid item xs={12}>
								<DateTimePicker
									label="End Time"
									value={endTime}
									onChange={setEndTime}
									renderInput={(params) => <TextField {...params} fullWidth />}
								/>
							</Grid>

							<Grid item xs={12}>
								<Button variant="contained" color="secondary" fullWidth onClick={calculateAmount}>
									Book Spot
								</Button>
								{paymentDetails && (
									<Button variant="contained" color="primary" onClick={downloadPDF} sx={{ mt: 2, mr: 2 }}>
										Download Receipt
									</Button>
								)}
								<Button
									variant="contained"
									color="primary"
									onClick={() => {
										navigate("/home");
									}}
									sx={{ mt: 2 }}
								>
									GO HOME
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Box>
			<Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
				<DialogTitle>Total Amount</DialogTitle>
				<DialogContent>
					<Typography variant="h6">You need to pay ₹{totalAmount}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)} color="secondary">
						Cancel
					</Button>
					<Button
						onClick={() => {
							setOpenDialog(false);
							processPayment();
						}}
						color="primary"
					>
						OK
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
		</LocalizationProvider>
		</Dialog>

	);
};

export { Booking };
