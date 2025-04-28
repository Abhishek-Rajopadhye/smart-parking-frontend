import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, vi, beforeEach, expect } from "vitest";
import axios from "axios";
import { Profile } from "../src/pages/Profile";
import { AuthContext } from "../src/context/AuthContext";

// Mock MUI Dialogs and custom components
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
		Container: ({ children }) => <div>{children}</div>,
		Card: ({ children }) => <div>{children}</div>,
		CardContent: ({ children }) => <div>{children}</div>,
		CardActions: ({ children }) => <div>{children}</div>,
		Grid: ({ children }) => <div>{children}</div>,
		Box: ({ children }) => <div>{children}</div>,
		Divider: ({ children }) => <div>{children}</div>,
		Typography: ({ children }) => <div>{children}</div>,
		Avatar: () => <div data-testid="avatar" />,
		Button: ({ children, ...props }) => (
			<button {...props} type="button">
				{children}
			</button>
		),
	};
});
vi.mock("../src/components/EditProfileModal", () => ({
	EditProfileModal: ({ open, handleClose, user, handleSave }) =>
		open ? (
			<div data-testid="edit-profile-modal">
				<button onClick={() => handleSave({ ...user, name: "New Name" })}>Save Profile</button>
				<button onClick={handleClose}>Close</button>
			</div>
		) : null,
}));
vi.mock("../src/components/EditSpot", () => ({
	EditSpot: ({ open, handleClose, spot, handleSave }) =>
		open ? (
			<div data-testid="edit-spot-modal">
				<button onClick={() => handleSave(spot.id, { ...spot, title: "Updated Spot" })}>Save Spot</button>
				<button onClick={handleClose}>Close</button>
			</div>
		) : null,
}));
vi.mock("../src/components/SpotBookingView", () => ({
	SpotBookingView: ({ bookingDetails }) => <div data-testid="spot-booking-view">{JSON.stringify(bookingDetails)}</div>,
}));
vi.mock("../src/components/ConfirmationDialogBox", () => ({
	ConfirmationDialogBox: ({ open, message, onCancel, onConfirm }) =>
		open ? (
			<div data-testid="confirmation-dialog">
				<span>{message}</span>
				<button onClick={onConfirm}>Confirm</button>
				<button onClick={onCancel}>Cancel</button>
			</div>
		) : null,
}));

// Mock axios
vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockUser = {
	id: "1",
	name: "Test User",
	email: "test@example.com",
	phone: "1234567890",
	profile_picture: "",
};

const mockSpots = [
	{
		id: "spot1",
		title: "Test Spot 1",
		address: "123 Main St",
		description: "A nice spot",
		openTime: "08:00",
		closeTime: "20:00",
		hourlyRate: 100,
		openDays: "Mon,Tue,Wed,Thu,Fri",
		totalEarning: 500,
	},
];

describe("Profile Page", () => {
	beforeEach(() => {
		// Mock localStorage
		vi.stubGlobal("localStorage", {
			getItem: vi.fn((key) => {
				if (key === "token") return "mock-token";
				if (key === "user_id") return "1";
				return null;
			}),
			setItem: vi.fn(),
		});

		// Mock axios responses
		axios.get.mockImplementation((url) => {
			if (url.includes("/users/profile/")) {
				return Promise.resolve({ status: 200, data: { ...mockUser } });
			}
			if (url.includes("/spots/owner/")) {
				return Promise.resolve({ status: 200, data: mockSpots });
			}
			if (url.includes("/bookings/spot/")) {
				return Promise.resolve({ status: 200, data: [{ id: "booking1", spotId: "spot1" }] });
			}
			return Promise.resolve({ status: 200, data: [] });
		});
		axios.put.mockResolvedValue({ status: 200, data: { ...mockUser, name: "New Name" } });
		axios.delete.mockResolvedValue({ status: 200, data: [] });
	});

	test("renders user profile and spots", async () => {
		render(
			<AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
				<Profile />
			</AuthContext.Provider>
		);
		await waitFor(() => {
			expect(screen.getByText("Test User")).toBeInTheDocument();
			expect(screen.getByText("test@example.com")).toBeInTheDocument();
			expect(screen.getByText("Ph.No: 1234567890")).toBeInTheDocument();
			expect(screen.getByText("Test Spot 1")).toBeInTheDocument();
			expect(screen.getByText("A nice spot")).toBeInTheDocument();
			expect(screen.getByText("Earnings:")).toBeInTheDocument();
		});
	});

	test("opens and saves profile edit modal", async () => {
		const setUser = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser, setUser }}>
				<Profile />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Edit Profile"));
		expect(screen.getByTestId("edit-profile-modal")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Save Profile"));
		await waitFor(() => {
			expect(setUser).toHaveBeenCalled();
		});
	});

	test("opens and closes edit spot modal", async () => {
		render(
			<AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
				<Profile />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("edit-spot-modal")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Close"));
		await waitFor(() => {
			expect(screen.queryByTestId("edit-spot-modal")).not.toBeInTheDocument();
		});
	});

	test("shows booking history dialog when View Bookings is clicked", async () => {
		render(
			<AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
				<Profile />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("View Bookings"));
		await waitFor(() => {
			expect(screen.getByTestId("spot-booking-view")).toBeInTheDocument();
		});
	});

	test("shows confirmation dialog and deletes spot", async () => {
		render(
			<AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
				<Profile />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Confirm"));
		await waitFor(() => {
			expect(screen.queryByTestId("confirmation-dialog")).not.toBeInTheDocument();
		});
	});
});
