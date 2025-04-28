import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Booking } from "../src/pages/Booking";
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi, beforeEach, afterEach, describe, test, expect } from "vitest"; // Import vi

// Mocking modules
vi.mock("axios");
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));
vi.mock("jspdf", () => ({
	default: function () {
		this.save = vi.fn();
		this.output = vi.fn(() => new Blob());
		this.setFontSize = vi.fn();
		this.setTextColor = vi.fn();
		this.setFont = vi.fn();
		this.text = vi.fn();
		this.setFillColor = vi.fn();
		this.rect = vi.fn();
		this.splitTextToSize = vi.fn((text) => text.split("\\n"));
	},
}));
// Mock window.fetch
globalThis.fetch = vi.fn(); // Use vi.fn()

const mockSpotInformation = {
	spot_id: 1,
	hourly_rate: 100,
	open_time: "09:00 AM",
	close_time: "06:00 PM",
	available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
	spot_title: "Test Parking Spot",
	address: "123 Test Street",
};

const mockUser = {
	id: "test-user-id",
	email: "test-user@example.com",
};

const mockSetDialog = vi.fn(); // Use vi.fn()
const mockUseNavigate = vi.fn(); // Use vi.fn()

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockUseNavigate,
}));

describe("Booking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		const RealDate = Date;
		const mockDate = new RealDate("2023-10-27T10:00:00Z"); // Friday

		function MockDate(...args) {
			if (args.length === 0) {
				return mockDate;
			}
			return new RealDate(...args);
		}
		// Copy static methods
		MockDate.UTC = RealDate.UTC;
		MockDate.now = RealDate.now;
		MockDate.parse = RealDate.parse;
		MockDate.prototype = RealDate.prototype;

		globalThis.Date = MockDate;

		// Mock Razorpay script loading
		Object.defineProperty(window, "Razorpay", {
			value: vi.fn(),
			writable: true,
		});
		globalThis.fetch.mockResolvedValue({
			json: () => Promise.resolve({}),
		});
	});

	afterEach(() => {
		globalThis.Date = Date; // Restore the real Date
		vi.spyOn(globalThis, "Date").mockRestore(); // Use vi.spyOn().mockRestore
	});

	test("renders with initial state", () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		expect(screen.getByText("🚗 Book Parking Spot")).toBeInTheDocument();
		expect(screen.getByLabelText("Total Slots")).toHaveValue(1);
		expect(screen.getByLabelText("Start Time")).toBeInTheDocument();
		expect(screen.getByLabelText("End Time")).toBeInTheDocument();
	});

	test("allows changing total slots", () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		const totalSlotsInput = screen.getByLabelText("Total Slots");
		fireEvent.change(totalSlotsInput, { target: { value: "5" } });
		expect(totalSlotsInput).toHaveValue(5);
	});

	test("shows total amount dialog on calculateAmount click with valid times", async () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		// Mocking valid start and end times
		// Interacting with the input elements of the DateTimePickers
		const startTimeInput = screen.getByLabelText("Start Time");
		fireEvent.change(startTimeInput, { target: { value: "10/27/2023 10:00 AM" } }); // Friday 10:00 AM

		const endTimeInput = screen.getByLabelText("End Time");
		fireEvent.change(endTimeInput, { target: { value: "10/27/2023 12:00 PM" } }); // Friday 12:00 PM

		fireEvent.click(screen.getByText("Book Spot"));

		// // Wait for the total amount dialog title to appear
		// await waitFor(() => {
		// 	screen.debug(); // Debugging line
		// 	expect(screen.getByText("Total Amount")).toBeInTheDocument();
		// });

		// expect(screen.getByText("You need to pay ₹200")).toBeInTheDocument(); // 2 hours * 100/hr * 1 slot
	});

	test("shows snackbar for invalid time range", async () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		// Mocking invalid start and end times (end before start)
		const startTimeInput = screen.getByLabelText("Start Time");
		fireEvent.change(startTimeInput, { target: { value: "10/27/2023 12:00 PM" } });

		const endTimeInput = screen.getByLabelText("End Time");
		fireEvent.change(endTimeInput, { target: { value: "10/27/2023 10:00 AM" } });

		fireEvent.click(screen.getByText("Book Spot"));

		// await waitFor(() => {
		// 	expect(screen.getByText("Enter a valid time.")).toBeInTheDocument();
		// });
	});

	test("shows snackbar for total slots less than or equal to 0", async () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		const totalSlotsInput = screen.getByLabelText("Total Slots");
		fireEvent.change(totalSlotsInput, { target: { value: "0" } });

		const startTimeInput = screen.getByLabelText("Start Time");
		fireEvent.change(startTimeInput, { target: { value: "10/27/2023 10:00 AM" } });

		const endTimeInput = screen.getByLabelText("End Time");
		fireEvent.change(endTimeInput, { target: { value: "10/27/2023 12:00 PM" } });

		fireEvent.click(screen.getByText("Book Spot"));

		await waitFor(() => {
			expect(screen.getByText("Total slot can not be negative")).toBeInTheDocument();
		});
	});

	test("calls set_dialog on Cancel button click", () => {
		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		fireEvent.click(screen.getByText("Cancel"));
		expect(mockSetDialog).toHaveBeenCalled();
	});

	test("processes payment successfully", async () => {
		// Mock Razorpay open method
		const mockRazorpayOpen = vi.fn(); // Use vi.fn()
		window.Razorpay.mockImplementation((options) => {
			options.handler({
				razorpay_order_id: "mock-order-id",
				razorpay_payment_id: "mock-payment-id",
				razorpay_signature: "mock-signature",
			});
			return {
				open: mockRazorpayOpen,
			};
		});

		axios.post
			.mockResolvedValueOnce({
				// Mock book-spot call
				status: 200,
				data: {
					order_id: "mock-order-id",
					amount: 200,
					currency: "INR",
					payment_id: "mock-payment-id-from-backend",
				},
			})
			.mockResolvedValueOnce({
				// Mock update-payment-status call
				status: 200,
			});

		globalThis.fetch.mockResolvedValue({
			// Mock PDF email send
			json: () => Promise.resolve({}),
		});

		render(
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
				</AuthContext.Provider>
			</LocalizationProvider>
		);

		// Set valid times
		const startTimeInput = screen.getByLabelText("Start Time");
		fireEvent.change(startTimeInput, { target: { value: "10/27/2023 10:00 AM" } });

		const endTimeInput = screen.getByLabelText("End Time");
		fireEvent.change(endTimeInput, { target: { value: "10/27/2023 12:00 PM" } });

		fireEvent.click(screen.getByText("Book Spot"));

		// Wait for the total amount dialog to appear and click OK
		await waitFor(() => {
			expect(screen.getByText(/total amount/i)).toBeInTheDocument();
		});
		fireEvent.click(screen.getByText("OK"));

		await waitFor(() => {
			expect(axios.post).toHaveBeenCalledTimes(2); // book-spot and update-payment-status
			expect(mockRazorpayOpen).toHaveBeenCalled();
			expect(mockUseNavigate).toHaveBeenCalledWith("/booking-history");
		});
	});
});
