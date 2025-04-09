import { useContext, useEffect, useState } from "react";
import { Container } from "@mui/material";
import { UserBookingView } from "../components/UserBookingView";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BACKEND_URL } from "../const";
import "../style/booking_history.css";

/**
 * BookingHistory page component for displaying user booking history.
 *
 * Fetches and displays booking details for the logged-in user.
 *
 * @component
 * @returns {JSX.Element} The BookingHistory page component.
 */
const BookingHistory = () => {
    const { user } = useContext(AuthContext);
    const [userBookings, setUserBookings] = useState([]);

    /**
     * Fetches booking details for the logged-in user.
     */
    useEffect(() => {
        const fetchDetailsUserBookings = async () => {
            const response = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
            if (response.status === 200) {
                setUserBookings(response.data);
            }
        };

        fetchDetailsUserBookings();
    }, [user.id]);

    /**
     * Handles the cancellation of a booking.
     *
     * @param {number} bookingId - The ID of the booking to cancel.
     */
    const handleCancelBooking = async (bookingId) => {
        const response = await axios.delete(`${BACKEND_URL}/bookings/${bookingId}`);
        if (response.status === 200) {
            const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
            if (userDetailsResponse.status === 200) {
                setUserBookings(userDetailsResponse.data);
            }
        }
    };

    /**
     * Handles the check-in of a booking.
     *
     * @param {number} bookingId - The ID of the booking to check in.
     */
    const handleCheckIn = async (bookingId) => {
        const response = await axios.put(`${BACKEND_URL}/bookings/checkin/${bookingId}`);
        if (response.status === 200) {
            const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
            if (userDetailsResponse.status === 200) {
                setUserBookings(userDetailsResponse.data);
            }
        }
    };

    /**
     * Handles the check-out of a booking.
     *
     * @param {number} bookingId - The ID of the booking to check out.
     */
    const handleCheckOut = async (bookingId) => {
        const response = await axios.put(`${BACKEND_URL}/bookings/checkout/${bookingId}`);
        if (response.status === 200) {
            const userDetailsResponse = await axios.get(`${BACKEND_URL}/bookings/user/${user.id}`);
            if (userDetailsResponse.status === 200) {
                setUserBookings(userDetailsResponse.data);
            }
        }
    };

    return (
        <Container sx={{ position: "relative", width: "100vw", alignContent: "center" }}>
            <UserBookingView
                bookingDetails={userBookings}
                cancelBooking={handleCancelBooking}
                checkIn={handleCheckIn}
                checkOut={handleCheckOut}
            />
        </Container>
    );
};

export { BookingHistory };