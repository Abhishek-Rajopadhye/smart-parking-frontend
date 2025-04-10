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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../style/booking.css";
import { BACKEND_URL } from "../const";
import { AuthContext } from "../context/AuthContext";
import { set } from "date-fns";

//spot_information is object which hold the all information
const Booking = ({ spot_information, open, set_dialog }) => {
  console.log(spot_information.available_days);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  console.log(user.email);
  const [razorpay_signature, setRazorpaySignature] = useState(null);
  const [razorpay_order_id, setRazorpayOrderId] = useState(null);
  const [totalSlots, setTotalSlots] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [ratePerHour] = useState(spot_information.hourly_rate);
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
    const isoString = selectedDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    }); //
    console.log(isoString);
    const dateParts = isoString.split(",")[0].split("/");
    const timeParts = isoString.split(",")[1].trim().split(":");
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const period = timeParts[2].split(" ")[1];

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    let [openTimeHour, openTimeMin] = spot_information.open_time
      .split(" ")[0]
      .split(":");
    let [closeTimeHour, closeTimeMin] = spot_information.close_time
      .split(" ")[0]
      .split(":");
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
    const primaryColor = "#007bff";
    const lightGray = "#f2f2f2";
    const darkGray = "#333";
    //E9DFC3
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
        [
          "Address",
          ["Address", doc.splitTextToSize(spot_information.address, 80)],
        ],
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

    // Charges
    const hourlyRate = ratePerHour;

    //const tax = Math.ceil(totalAmount * 0.18);
    //const amount = totalAmount + tax;

    y = drawSectionTitle("Charges Breakdown", y);
    y = drawTable(
      ["Description", "Amount"],
      [
        [
          `${hourlyRate}/hr x ${Math.ceil(totalAmount / ratePerHour)} hrs`,
          totalAmount,
        ],
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
    doc.text(
      "Thank you for using Smart Parking!",
      105,
      y,
      null,
      null,
      "center"
    );

    doc.save("booking_receipt.pdf");

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

    showSnackbar(
      "Booking successfully and Receipt sent to your register email!",
      "success"
    );
  };

  useEffect(() => {
    if (paymentStatus) {
      downloadPDF();
      setEndTime("");
      setStartTime("");
      setTotalSlots(0);
      setFlag(false);
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
    if (
      !validateDateTime(startTime, "start") ||
      !validateDateTime(endTime, "end")
    ) {
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
      if(flag){
        console.log("Cancel booking start check");
        const response = await axios.put(`${BACKEND_URL}/bookings/update-booking-slots`, {
          spot_id: spot_information.spot_id,
          total_slots: prevTotalSlots,
        })
        setPrevTotalSlots(0);
        setFlag(false);
      }
      const start_time = dateTimeToString(startTime);
      const end_time = dateTimeToString(endTime);
      console.log(startTime, start_time);
      console.log(endTime, end_time);
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
      console.log(orderData);
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
            console.log("Payment response:", response);
            const check_payment = await axios.post(
              `${BACKEND_URL}/bookings/update-payment-status`,
              {
                start_time: indianStartTime,
                end_time: indianEndTime,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_id: orderData.payment_id,
                total_slots: totalSlots,
              }
            );
            if (check_payment.status === 200) {
              setPaymentStatus(true);
              console.log("Payment successful:", check_payment.data);
            }
          } catch (error) {
            if (error.response) {
              const errorMsg = error.response.data?.detail || "Payment failed.";
              showSnackbar(
                "Booking failed We're refunding your payment",
                "error"
              );
            } else {
              showSnackbar(
                "Booking failed We're refunding your payment",
                "error"
              );
            }
          }
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
        showSnackbar(
          "No response from server. Please check your connection.",
          "error"
        );
      } else {
        showSnackbar("An unexpected error occurred.", "error");
      }
    }
  };

  const handleCancel = async () => {
    try {
      console.log("Cancel booking");
      console.log(razorpay_order_id);
      if(flag && totalSlots != 0 && razorpay_order_id != null){
        console.log("Cancel booking start");
        const response = await axios.put(`${BACKEND_URL}/bookings/update-booking-slots`, {
          spot_id: spot_information.spot_id,
          total_slots: totalSlots,
        })
        setTotalSlots(0);
        setStartTime(null);
        setEndTime(null);
        setFlag(false);
      } 
      set_dialog();
    } catch(error) {
      console.error("Error:", error);
      // showSnackbar("Failed to cancel booking", "error");
    }
   
   }


  return (
    <Dialog open={open}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {/* <Box className="form-container"> */}
        <Box
          className="booking-form-container"
          sx={{
            // p: 3,
            width: "100%",
            maxWidth: 500,
            mx: "auto",
            overflowX: "hidden",
            "@media (max-width: 600px)": {
              // p: 2,
              maxWidth: "100%",
            },
          }}
        >
          <Box className="form-box" sx={{ mt: 0, width: "auto" }}>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              fontWeight="bold"
            >
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
                    const days = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ];
                    return !spot_information.available_days.includes(
                      days[date.getDay()]
                    );
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
                    const days = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ];
                    return !spot_information.available_days.includes(
                      days[date.getDay()]
                    );
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
        {/* </Box> */}
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
        <Button
          startIcon={<DirectionsCarIcon />}
          variant="contained"
          color="secondary"
          //fullWidth
          onClick={calculateAmount}
        >
          Book Spot
        </Button>
        <Button
          startIcon={<CancelIcon />}
          variant="outlined"
          color="error"
          // fullWidth
          onClick={() => handleCancel()}
          // disabled={flag}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { Booking };
