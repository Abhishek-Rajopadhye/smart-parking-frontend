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
        CircularProgress: () => <div data-testid="circular-progress" />,
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
vi.mock("../src/components/UserBookingView", () => ({
    UserBookingView: ({ bookingDetails, cancelBooking, checkIn, checkOut }) => (
        <div data-testid="user-booking-view">
            {JSON.stringify(bookingDetails)}
            <button onClick={() => cancelBooking && cancelBooking(1)}>Cancel Booking</button>
            <button onClick={() => checkIn && checkIn(1)}>Check In</button>
            <button onClick={() => checkOut && checkOut(1)}>Check Out</button>
        </div>
    ),
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

const mockBookings = [
    {
        id: 1,
        spotId: "spot1",
        status: "active",
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
            if (url.includes("/bookings/user/")) {
                return Promise.resolve({ status: 200, data: mockBookings });
            }
            return Promise.resolve({ status: 200, data: [] });
        });
        axios.put.mockResolvedValue({ status: 200, data: { ...mockUser, name: "New Name" } });
        axios.delete.mockResolvedValue({ status: 200, data: [] });
    });

    test("renders user profile and bookings", async () => {
        render(
            <AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
                <Profile />
            </AuthContext.Provider>
        );
        await waitFor(() => {
            expect(screen.getByText("Test User")).toBeInTheDocument();
            expect(screen.getByText("test@example.com")).toBeInTheDocument();
            expect(screen.getByText("Ph.No: 1234567890")).toBeInTheDocument();
            expect(screen.getByText("My Bookings")).toBeInTheDocument();
            expect(screen.getByTestId("user-booking-view")).toBeInTheDocument();
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

    test("shows loading spinner when bookings are loading", async () => {
        axios.get.mockImplementationOnce(() =>
            new Promise((resolve) => setTimeout(() => resolve({ status: 200, data: mockBookings }), 100))
        );
        render(
            <AuthContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
                <Profile />
            </AuthContext.Provider>
        );
        expect(screen.getByTestId("circular-progress")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("user-booking-view")).toBeInTheDocument();
        });
    });
});