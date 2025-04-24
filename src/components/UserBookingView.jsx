import { useState, Fragment } from "react";
import {
	Typography,
	Paper,
	Box,
	Button,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
	TablePagination,
	TableBody,
	Collapse,
	IconButton,
} from "@mui/material";
import { CurrencyRupee } from "@mui/icons-material";
import { ConfirmationDialogBox } from "./ConfirmationDialogBox";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";
import { BACKEND_URL } from "../const";
import { Booking } from "../pages/Booking";

/**
 * UserBookingView Component
 *
 * This component displays a table of user booking details and allows users to cancel bookings,
 * check in, and check out. It also allows expanding rows to show additional details like the address.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.bookingDetails - An array of booking details to display.
 * @param {Function} props.cancelBooking - A function to handle booking cancellation.
 * @param {Function} props.checkIn - A function to handle check-in.
 * @param {Function} props.checkOut - A function to handle check-out.
 *
 * @returns {JSX.Element} The rendered UserBookingView component.
 */
const UserBookingView = ({ bookingDetails, cancelBooking, checkIn, checkOut }) => {
	const [openDialog, setOpenDialog] = useState(false);
	const [spotInformation, setSpotInformation] = useState(null);
	const [previousBooking, setPreviousBooking] = useState(null);
	const [bookAgainOpen, setBookAgainOpen] = useState(false);
	const [dialogMessage, setDialogMessage] = useState("");
	const [dialogAction, setDialogAction] = useState(null); // Function to execute on confirmation
	const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded
	const [page, setPage] = useState(0); // Current page
	const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

	/**
	 * Sorts the booking details in the desired priority order:
	 * 1. Checked In bookings (chronologically).
	 * 2. Pending bookings (chronologically).
	 * 3. Cancelled/Completed bookings (chronologically).
	 */
	const sortedBookings = [...bookingDetails]
		.sort((a, b) => new Date(a.start_date_time) - new Date(b.start_date_time)) // Sort chronologically
		.sort((a, b) => {
			// Sort by status priority: Checked In > Pending > Cancelled/Completed
			if (a.status === "Checked In" && b.status !== "Checked In") return -1;
			if (a.status !== "Checked In" && b.status === "Checked In") return 1;
			if (a.status === "Pending" && b.status !== "Pending") return -1;
			if (a.status !== "Pending" && b.status === "Pending") return 1;
			return 0;
		});

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0); // Reset to the first page
	};

	const canCheckIn = (startDateTime) => {
		const now = new Date();
		const startTime = new Date(startDateTime);
		const diffInMinutes = Math.floor((startTime - now) / (1000 * 60)); // Difference in minutes
		return diffInMinutes <= 15 && diffInMinutes >= 0; // Allow check-in within 15 minutes before start time
	};

	const handleOpenDialog = (bookingId, actionType) => {
		if (actionType === "cancel") {
			setDialogMessage("Are you sure you want to cancel this booking?");
			setDialogAction(() => () => cancelBooking(bookingId));
		} else if (actionType === "checkIn") {
			setDialogMessage("Are you sure you want to check in for this booking?");
			setDialogAction(() => () => checkIn(bookingId));
		} else if (actionType === "checkOut") {
			setDialogMessage("Are you sure you want to check out for this booking?");
			setDialogAction(() => () => checkOut(bookingId));
		}

		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setDialogMessage("");
		setDialogAction(null);
	};

	const toggleRowExpansion = (bookingId) => {
		setExpandedRow((prev) => (prev === bookingId ? null : bookingId));
	};
	const toggleBookAgainOpen = () => {
		setBookAgainOpen(!bookAgainOpen);
	};

	// Book Again handler
	const handleBookAgain = async (spotId, booking) => {
		try {
			const response = await axios.get(`${BACKEND_URL}/spotdetails/get-spot/${spotId}`);
			if (response.status === 200) {
				const spot_information = response.data;
				setSpotInformation(spot_information);
				setPreviousBooking(booking);
				toggleBookAgainOpen();
			}
		} catch (error) {
			console.error("Failed to fetch spot information", error);
		}
	};

	return (
		<Box sx={{ padding: 1 }}>
			<TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, margin: "auto" }}>
				<Table stickyHeader sx={{ width: "85vw", p:"2px" }}>
					<TableHead>
						<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
							<TableCell sx={{ maxWidth: "15px" }} />
							<TableCell sx={{ fontWeight: "bold", maxWidth: "15px" }}>Name</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Slots Booked</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Cost</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((booking) => (
							<Fragment key={booking.id}>
								<TableRow hover onClick={() => toggleRowExpansion(booking.id)}>
									<TableCell>
										<IconButton aria-label="expand row" size="small">
											{expandedRow === booking.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
										</IconButton>
									</TableCell>
									<TableCell>
										<Typography variant="body1" fontWeight="500">
											{booking.spot_title}
										</Typography>
										<Collapse in={true} unmountOnExit>
											<Typography variant="caption" color="text.secondary">
												{`From: ${booking.start_date_time} - ${booking.end_date_time}`}
											</Typography>
										</Collapse>
									</TableCell>
									<TableCell variant="body1" fontWeight="500">
										{booking.total_slots}
									</TableCell>
									<TableCell>
										<Typography variant="body1" fontWeight="500">
											<CurrencyRupee fontSize="small" /> {booking.payment_amount}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="body1"
											sx={{
												color:
													booking.status === "Booked"
														? "orange"
														: booking.status === "Checked In"
														? "blue"
														: booking.status === "Cancelled"
														? "red"
														: "green",
											}}
										>
											{booking.status}
										</Typography>
									</TableCell>
									<TableCell>
										<Box display="flex" gap={1}>
											{booking.status === "Booked" && (
												<Button
													onClick={() => handleOpenDialog(booking.id, "cancel")}
													variant="contained"
													color="error"
													size="small"
												>
													Cancel
												</Button>
											)}
											{booking.status === "Booked" && canCheckIn(booking.start_date_time) && (
												<Button
													onClick={() => handleOpenDialog(booking.id, "checkIn")}
													variant="contained"
													color="success"
													size="small"
												>
													Check In
												</Button>
											)}
											{booking.status === "Checked In" && (
												<Button
													onClick={() => handleOpenDialog(booking.id, "checkOut")}
													variant="contained"
													color="primary"
													size="small"
												>
													Check Out
												</Button>
											)}
											{(booking.status === "Cancelled" || booking.status === "Completed" || booking.status === "Booked" || booking.status === "Success") && (
												<Button
													onClick={() => handleBookAgain(booking.spot_id, booking)}
													variant="outlined"
													color="secondary"
													size="small"
												>
													Book Again
												</Button>
											)}
										</Box>
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
										<Collapse in={expandedRow === booking.id} timeout="auto" unmountOnExit>
											<Box margin={2}>
												<Typography variant="subtitle1" gutterBottom>
													Address:
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{booking.spot_address}
												</Typography>
											</Box>
										</Collapse>
									</TableCell>
								</TableRow>
							</Fragment>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 20]}
					component="div"
					count={sortedBookings.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			{bookAgainOpen && (
				<Booking
					open={bookAgainOpen}
					set_dialog={toggleBookAgainOpen}
					previous_booking={previousBooking}
					spot_information={spotInformation}
				/>
			)}

			<ConfirmationDialogBox
				open={openDialog}
				message={dialogMessage}
				onConfirm={() => {
					if (dialogAction) dialogAction();
					handleCloseDialog();
				}}
				onCancel={handleCloseDialog}
			/>
		</Box>
	);
};

export { UserBookingView };
