import { useState, Fragment } from "react";
import {
	Typography,
	Paper,
	Divider,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
    Collapse,
    IconButton,
    Box
} from "@mui/material";
import { CurrencyRupee } from "@mui/icons-material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

/**
 * Component to display booking details for the owner in a tabular format.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {Array} props.bookingDetails - An array of booking objects containing details about each booking.
 *
 * @returns {JSX.Element} A table displaying the booking details.
 */
const OwnerBookingView = ({ bookingDetails }) => {
	const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded

    /**
     * Toggles the expanded state of a row.
     *
     * @param {number} bookingId - The ID of the booking to expand or collapse.
     */
    const toggleRowExpansion = (bookingId) => {
        setExpandedRow((prev) => (prev === bookingId ? null : bookingId));
    };

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell/>
						<TableCell>Name</TableCell>
						<TableCell>Revenue</TableCell>
						<TableCell>Status</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{bookingDetails != [] ? (
						bookingDetails.map((booking) => (
							<Fragment key={booking.id}>
                                <TableRow key={booking.id}>
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
                                </TableRow>
                                <TableRow key="expanded_row">
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
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
	);
};

export { OwnerBookingView };
