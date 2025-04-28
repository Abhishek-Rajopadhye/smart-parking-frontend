import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { BookingHistory } from "../src/pages/BookingHistory";
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";

afterEach(() => {
	cleanup();
});

// Mocking modules
vi.mock("axios");
vi.mock("../src/components/UserBookingView", () => ({
	UserBookingView: ({ bookingDetails, cancelBooking, checkIn, checkOut }) => (
		<div data-testid="user-booking-view">
			{bookingDetails.map((booking) => (
				<div key={booking.id}>
					{booking.spot_title}
					<button onClick={() => cancelBooking(booking.id)}>Cancel</button>
					<button onClick={() => checkIn(booking.id)}>Check In</button>
					<button onClick={() => checkOut(booking.id)}>Check Out</button>
				</div>
			))}
		</div>
	),
}));
vi.mock("../src/const", () => ({
	BACKEND_URL: "http://mocked-backend-url",
}));

const mockUser = { id: "test-user-id" };
const mockUserBookings = [
	{ id: 1, spot_title: "Booking 1" },
	{ id: 2, spot_title: "Booking 2" },
];

describe("BookingHistory", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("fetches and displays user bookings on mount", async () => {
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings });

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<BookingHistory />
			</AuthContext.Provider>
		);

		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledWith("http://mocked-backend-url/bookings/user/test-user-id");
			expect(screen.getByText("Booking 1")).toBeInTheDocument();
			expect(screen.getByText("Booking 2")).toBeInTheDocument();
		});
	});

	test("handles booking cancellation", async () => {
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings }); // Initial fetch
		axios.delete.mockResolvedValueOnce({ status: 200 }); // Cancel call
		axios.get.mockResolvedValueOnce({ status: 200, data: [{ id: 2, spot_title: "Booking 2" }] }); // Refetch after cancel

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<BookingHistory />
			</AuthContext.Provider>
		);

		await waitFor(() => {
			expect(screen.getByText("Booking 1")).toBeInTheDocument();
		});

		const booking1Div = screen.getByText("Booking 1").closest("div");
		const cancelButton = screen.getAllByText("Cancel").find((btn) => booking1Div.contains(btn));
		fireEvent.click(cancelButton);

		await waitFor(() => {
			expect(axios.delete).toHaveBeenCalledWith("http://mocked-backend-url/bookings/1");
			expect(axios.get).toHaveBeenCalledTimes(2);
			expect(screen.queryByText("Booking 1")).not.toBeInTheDocument();
			expect(screen.getByText("Booking 2")).toBeInTheDocument();
		});
	});

	test("handles booking check-in", async () => {
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings }); // Initial fetch
		axios.put.mockResolvedValueOnce({ status: 200 }); // Check-in call
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings }); // Refetch after check-in

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<BookingHistory />
			</AuthContext.Provider>
		);

		await waitFor(() => {
			expect(screen.getByText("Booking 1")).toBeInTheDocument();
		});

		const booking1Div = screen.getByText("Booking 1").closest("div");
		const checkInButton = screen.getAllByText("Check In").find((btn) => booking1Div.contains(btn));
		fireEvent.click(checkInButton);

		await waitFor(() => {
			expect(axios.put).toHaveBeenCalledWith("http://mocked-backend-url/bookings/checkin/1");
			expect(axios.get).toHaveBeenCalledTimes(2); // Initial fetch and refetch
		});
	});

	test("handles booking check-out", async () => {
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings }); // Initial fetch
		axios.put.mockResolvedValueOnce({ status: 200 }); // Check-out call
		axios.get.mockResolvedValueOnce({ status: 200, data: mockUserBookings }); // Refetch after check-out

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<BookingHistory />
			</AuthContext.Provider>
		);

		await waitFor(() => {
			expect(screen.getByText("Booking 1")).toBeInTheDocument();
		});

		// Find the booking container for "Booking 1"
		const booking1Div = screen.getByText("Booking 1").closest("div");
		// Find the "Check Out" button within that container
		const checkOutButton = screen.getAllByText("Check Out").find((btn) => booking1Div.contains(btn));

		fireEvent.click(checkOutButton);

		await waitFor(() => {
			expect(axios.put).toHaveBeenCalledWith("http://mocked-backend-url/bookings/checkout/1");
			expect(axios.get).toHaveBeenCalledTimes(2); // Initial fetch and refetch
		});
	});
});
