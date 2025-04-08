/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
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
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../style/booking.css";
import { BACKEND_URL } from "../const";
import { AuthContext } from "../context/AuthContext";

//spot_information is object which hold the all information
const Booking = ({ spot_information, open, set_dialog }) => {
	console.log(spot_information.available_days);

	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	console.log(user.email);
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
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0, 0, 0, 0);
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const downloadPDF = async () => {
		const doc = new jsPDF();
		doc.setFontSize(20);
		doc.setFont("helvetica", "bold");
		doc.text("Parking Booking Receipt", 60, 20);
		doc.setLineWidth(0.5);
		doc.line(20, 25, 190, 25);
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("Booking Information", 20, 35);
		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");

		let y = 45;
		const lineSpacing = 8;

		doc.text(`Spot Name: ${spot_information.spot_title}`, 20, y);
		y += lineSpacing;
		doc.text(`Address: ${spot_information.address}`, 20, y);
		y += lineSpacing;
		doc.text(`Total Slots: ${totalSlots}`, 20, y);
		y += lineSpacing;
		y += 10;
		doc.setFont("helvetica", "bold");
		doc.setFontSize(14);
		doc.text("Payment Details", 20, y);

		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		y += 10;

		doc.text(`Order ID: ${paymentDetails.order_id}`, 20, y);
		y += lineSpacing;
		doc.text(`Payment ID: ${paymentDetails.payment_id}`, 20, y);
		y += lineSpacing;
		doc.text(`Amount Paid: ${paymentDetails.amount} Rs.`, 20, y);
		y += lineSpacing;
		y += 10;
		doc.setFont("helvetica", "bold");
		doc.setFontSize(14);
		doc.text("Timing", 20, y);

		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		y += 10;

		doc.text(`Start Time: ${indianStartTime}`, 20, y);
		y += lineSpacing;
		doc.text(`End Time: ${indianEndTime}`, 20, y);
		y += lineSpacing;
		y += 15;
		doc.setFontSize(10);
		doc.setFont("helvetica", "italic");
		doc.text("Thank you for using Smart Parking!", 20, y);

		//doc.save("booking_receipt.pdf");

		const pdfBlob = doc.output("blob");

		const formData = new FormData();
		const userEmail = user.email;
		formData.append("file", pdfBlob, "booking_receipt.pdf");
		formData.append("email", userEmail);
		// alert("Sending receipt to your email...");
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

		showSnackbar("Booking successfully and Receipt sent to your register email!", "success");
	};

	useEffect(() => {
		if (paymentStatus) {
			downloadPDF();
			setEndTime("");
			setStartTime("");
			setPaymentStatus(false);
			// navigate("/booking");
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
			console.log(startTime, start_time);
			console.log(endTime, end_time);

			if (spot_information.available_slots < totalSlots) {
				showSnackbar("No Slots availables", "error");
				return;
			}
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

			const options = {
				key: "rzp_test_82K1eUDvrHocUu",
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
	return (
		<Dialog open={open}>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box className="form-container">
					<Box className="form-container">
						<Box className="form-box" sx={{ mt: 0 }}>
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
										minDateTime={new Date()}
										shouldDisableDate={(date) => {
											const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
											const day = date.getDay();
											const dayName = days[day];
											return !spot_information.available_days.includes(dayName);
										}}
									/>
								</Grid>

								<Grid item xs={12}>
									<DateTimePicker
										label="End Time"
										value={endTime}
										onChange={setEndTime}
										renderInput={(params) => <TextField {...params} fullWidth />}
										minDateTime={new Date()}
										shouldDisableDate={(date) => {
											const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
											const day = date.getDay();
											const dayName = days[day];
											return !spot_information.available_days.includes(dayName);
										}}
									/>
								</Grid>

								<Grid item xs={12}>
									<Button variant="contained" color="secondary" fullWidth onClick={calculateAmount}>
										Book Spot
									</Button>
									{/* {paymentDetails && (
										<Button variant="contained" color="primary" onClick={downloadPDF} sx={{ mt: 2, mr: 2 }}>
											Download Receipt
										</Button>
									)} */}
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
									<Button
										variant="contained"
										color="primary"
										onClick={() => {
											set_dialog();
										}}
										sx={{ mt: 2, ml: 2 }}
									>
										Cancel
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
