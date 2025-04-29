import { useState, useEffect, useContext, useCallback } from "react";
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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BACKEND_URL } from "../const";
import { AuthContext } from "../context/AuthContext";

//spot_information is object which hold the all information
const Booking = ({ spot_information, open, set_dialog, previous_booking = null }) => {
	const navigate = useNavigate();
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
	const showSnackbar = useCallback((message, severity = "info") => {
		setOpenSnackbar({ open: true, message, severity });
	}, []);

	/**
	 * This function is used to validate the date and time
	 * It will check the selected date is future date or not
	 * It will check the selected day is available day or not
	 * It will check the selected time is between open time and close time
	 * It will check the selected time is between open time and close time
	 *
	 * @param {*} selectedDate - selected date and time
	 * @param {*} msg - message to set the start or end time
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
	 * This function is used to check the date is valid or not
	 * @param {*} date - date to check
	 * @returns boolean
	 */
	const dateTimeToString = (date) => {
		return date.toISOString().replace("T", " ").slice(0, 19);
	};

	/**
	 * This function is used to download the pdf of the booking receipt
	 * It will create a pdf with the booking details and send it to the user email
	 * It will also show the snackbar message if the pdf is sent successfully or not
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
	/**
	 * function is used to get the closest valid date
	 * @param {*} baseDate - previous booking date
	 * @param {*} availableDays - available days of the spot
	 * @returns closest valid date else return base date
	 */
	function getClosestValidDate(baseDate, availableDays) {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		let date = new Date(baseDate);
		for (let i = 0; i < 7; i++) {
			const dayStr = days[date.getDay()];
			if (availableDays.includes(dayStr)) {
				return date;
			}
			date.setDate(date.getDate() + 1);
		}
		return baseDate; // fallback, should not happen if availableDays is valid
	}
	/**
	 * This function is used to set the start and end time of the booking
	 * It will set the start time and end time to the closest valid date
	 * It will also set the total slots to the previous booking
	 * It will also set the payment status to false after the payment is successful
	 */
	useEffect(() => {
		if (previous_booking) {
			console.log(previous_booking);
			setTotalSlots(previous_booking.total_slots);

			const spotDays = spot_information.available_days || [];
			const currentDate = new Date();

			// Set start time
			let startDateTime = new Date(previous_booking.start_date_time);
			startDateTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
			let validStartDate = getClosestValidDate(startDateTime, spotDays);
			// Keep the original time
			validStartDate.setHours(startDateTime.getHours(), startDateTime.getMinutes(), 0, 0);
			setStartTime(validStartDate);

			// Set end time
			let endDateTime = new Date(previous_booking.end_date_time);
			endDateTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
			let validEndDate = getClosestValidDate(endDateTime, spotDays);
			validEndDate.setHours(endDateTime.getHours(), endDateTime.getMinutes(), 0, 0);
			setEndTime(validEndDate);
		}
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
	}, [paymentStatus, navigate, downloadPDF, showSnackbar, previous_booking, spot_information]);

	/**
	 * This function is used to calculate the amount of the parking slot
	 * Check if the payment status is true then it will return
	 * Check start time and end time valid or not
	 * If total slots is less than 0 then it will show the error message
	 * If the start time and end time is not selected then it will show the error message
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
	 * Function is used to process the payment and create the order
	 * If the payment is successful then it will update the payment status and also available slots
	 * If the payment is failed then it will show the error message
	 * @returns
	 */
	const processPayment = async () => {
		if (buttonDisabled) return;
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
	
	/**
	 * Handles the cancellation of a booking.
	 * - If the user cancels after starting the booking process,
	 *   it releases the reserved slots back to availability.
	 * - Sends a request to update the total available slots in the backend.
	 * - Resets local booking-related states like start time, end time, and flags.
	 * @param {*} e - on click cancel button
	 * @returns
	 */
	const handleCancel = async () => {
		if (buttonDisabled) return;
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
			set_dialog();
		} catch (error) {
			console.error("Error:", error);
			// showSnackbar("Failed to cancel booking", "error");
		}
	};

	return (
		<Dialog open={open}>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box
					className="booking-form-container"
					sx={{
						width: "100%",
						maxWidth: 500,
						mx: "auto",
						overflowX: "hidden",
						"@media (max-width: 600px)": {
							maxWidth: "100%",
						},
					}}
				>
					<Box className="form-box" sx={{ mt: 0, width: "auto" }}>
						<Typography variant="h4" gutterBottom align="center" fontWeight="bold">
							🚗 Book Parking Spot
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
			<DialogActions>
				<Button startIcon={<DirectionsCarIcon />} variant="contained" color="secondary" onClick={calculateAmount}>
					Book Spot
				</Button>
				<Button startIcon={<CancelIcon />} variant="outlined" color="error" onClick={() => handleCancel()}>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export { Booking };
