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
        <Box sx={{ padding: 3 }}>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell />
                            <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Cost</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedBookings.length > 0 ? (
                            sortedBookings.map((booking) => (
                                <Fragment key={booking.id}>
                                    <TableRow hover>
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
                                            <Typography variant="body1" fontWeight="500">
                                                {booking.spot_title}
                                            </Typography>
                                            <Collapse in={true} unmountOnExit>
                                                <Typography variant="caption" color="text.secondary">
                                                    {`From: ${booking.start_date_time} - ${booking.end_date_time}`}
                                                </Typography>
                                            </Collapse>
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
                                                        booking.status === "Pending"
                                                            ? "orange"
                                                            : booking.status === "Checked In"
                                                            ? "green"
                                                            : "gray",
                                                }}
                                            >
                                                {booking.status}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="body1" align="center" color="text.secondary">
                                        No bookings found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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