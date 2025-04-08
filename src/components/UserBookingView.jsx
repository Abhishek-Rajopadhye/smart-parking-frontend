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
	TableBody,
	Collapse,
	IconButton,
} from "@mui/material";
import { CurrencyRupee } from "@mui/icons-material";
import { ConfirmationDialogBox } from "./ConfirmationDialogBox";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

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
	const [dialogMessage, setDialogMessage] = useState("");
	const [dialogAction, setDialogAction] = useState(null); // Function to execute on confirmation
	const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded

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

	/**
	 * Checks if the user can check in for a booking.
	 * Users can only check in within 15 minutes before the start_date_time.
	 *
	 * @param {string} startDateTime - The start date and time of the booking.
	 * @returns {boolean} True if the user can check in, false otherwise.
	 */
	const canCheckIn = (startDateTime) => {
		const now = new Date();
		const startTime = new Date(startDateTime);
		const diffInMinutes = Math.floor(Math.abs((startTime - now) / (1000 * 60))); // Difference in minutes
		return diffInMinutes <= 15 && diffInMinutes >= 0; // Allow check-in within 15 minutes before start time
	};

	/**
	 * Handles opening the confirmation dialog.
	 *
	 * @param {number} bookingId - The ID of the booking.
	 * @param {string} actionType - The type of action ("cancel", "checkIn", or "checkOut").
	 */
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

	/**
	 * Handles closing the confirmation dialog.
	 */
	const handleCloseDialog = () => {
		setOpenDialog(false);
		setDialogMessage("");
		setDialogAction(null);
	};

	/**
	 * Toggles the expanded state of a row.
	 *
	 * @param {number} bookingId - The ID of the booking to expand or collapse.
	 */
	const toggleRowExpansion = (bookingId) => {
		setExpandedRow((prev) => (prev === bookingId ? null : bookingId));
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell />
							<TableCell>Name</TableCell>
							<TableCell>Cost</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedBookings.length > 0 ? (
							sortedBookings.map((booking) => (
								<Fragment key={booking.id}>
									<TableRow>
										<TableCell>
											<IconButton
												aria-label="expand row"
												size="small"
												onClick={() => toggleRowExpansion(booking.id)}
											>
												{expandedRow === booking.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
											</IconButton>
										</TableCell>
										<TableCell>
											<Typography>{booking.spot_title}</Typography>
											<Collapse in={true} unmountOnExit>
												{`From: ${booking.start_date_time} - ${booking.end_date_time}`}
											</Collapse>
										</TableCell>
										<TableCell>
											<CurrencyRupee fontSize="tiny" /> {booking.payment_amount}
										</TableCell>
										<TableCell>{booking.status}</TableCell>
										<TableCell>
											<Box display="flex" gap={1}>
												{/* Show Cancel button only if status is Pending */}
												{booking.status === "Pending" && (
													<Button
														onClick={() => handleOpenDialog(booking.id, "cancel")}
														variant="contained"
														color="error"
														size="small"
													>
														Cancel
													</Button>
												)}

												{/* Show Check-In button if status is Pending and within 15 minutes of start time */}
												{booking.status === "Pending" && canCheckIn(booking.start_date_time) && (
													<Button
														onClick={() => handleOpenDialog(booking.id, "checkIn")}
														variant="contained"
														color="success"
														size="small"
													>
														Check In
													</Button>
												)}

												{/* Show Check-Out button if status is Checked In */}
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

												{/* Placeholder space for actions when status is Cancelled or Completed */}
												{(booking.status === "Cancelled" || booking.status === "Completed") && (
													<Box width="100px" />
												)}
											</Box>
										</TableCell>
									</TableRow>
									<TableRow key="expanded_row">
										<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
											<Collapse in={expandedRow === booking.id} timeout="auto" unmountOnExit>
												<Box margin={1}>
													<Typography variant="subtitle1" gutterBottom>
														Address:
													</Typography>
													<Typography>{booking.spot_address}</Typography>
												</Box>
											</Collapse>
										</TableCell>
									</TableRow>
								</Fragment>
							))
						) : (
							<Typography>No bookings found.</Typography>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Confirmation Dialog */}
			<ConfirmationDialogBox
				open={openDialog}
				message={dialogMessage}
				onConfirm={() => {
					if (dialogAction) dialogAction();
					handleCloseDialog();
				}}
				onCancel={handleCloseDialog}
			/>
		</>
	);
};

export { UserBookingView };
