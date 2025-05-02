/* eslint-disable no-unused-vars */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, vi, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AppLayout from "../src/AppLayout";
import { AuthContext } from "../src/context/AuthContext";

// Mock all pages/components used in AppLayout routes
vi.mock("../src/pages/Profile", () => ({ Profile: () => <div>Profile Page</div> }));
vi.mock("../src/pages/BookingHistory", () => ({ BookingHistory: () => <div>Booking History Page</div> }));
vi.mock("../src/pages/HomePage", () => ({ default: ({ setSelectedMarker }) => <div>Home Page</div> }));
vi.mock("../src/pages/Auth", () => ({ Auth: () => <div>Auth Page</div> }));
vi.mock("../src/pages/Booking", () => ({ Booking: () => <div>Booking Page</div> }));
vi.mock("../src/pages/AddSpotUser", () => ({ AddSpotUser: () => <div>Spot Page</div> }));
vi.mock("../src/components/DetailInfo", () => ({ default: () => <div>Detail Info Page</div> }));
vi.mock("../src/pages/MapSearch", () => ({ default: () => <div>Map Search Page</div> }));
vi.mock("../src/pages/Validation", () => ({ default: () => <div>Validation Page</div> }));
vi.mock("../src/pages/OwnerDashboard", () => ({ default: () => <div>Owner Dashboard Page</div> }));

// Mock MUI components used in AppLayout
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		AppBar: ({ children }) => <nav data-testid="appbar">{children}</nav>,
		Toolbar: ({ children }) => <div data-testid="toolbar">{children}</div>,
		Typography: ({ children }) => <h1>{children}</h1>,
		IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
		Avatar: () => <div data-testid="avatar" />,
		Menu: ({ children }) => <div data-testid="menu">{children}</div>,
		MenuItem: ({ children, ...props }) => <div {...props}>{children}</div>,
		Button: ({ children, ...props }) => <button {...props}>{children}</button>,
		Box: ({ children }) => <div>{children}</div>,
		CircularProgress: () => <div>Loading...</div>,
	};
});

describe("AppLayout", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	test("renders AppBar and HomePage by default", async () => {
		render(
			<MemoryRouter initialEntries={["/homepage"]}>
				<AuthContext.Provider
					value={{
						user: { id: "1", email: "test@example.com", profile_picture: "" },
						logout: vi.fn(),
					}}
				>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		expect(screen.getByTestId("appbar")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
		});
	});

	test("renders Profile page for /profile route", async () => {
		render(
			<MemoryRouter initialEntries={["/profile"]}>
				<AuthContext.Provider
					value={{
						user: { id: "1", email: "test@example.com", profile_picture: "" },
						logout: vi.fn(),
					}}
				>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		await waitFor(() => {
			expect(screen.getByText(/Profile Page/i)).toBeInTheDocument();
		});
	});

	test("renders Booking History page for /booking-history route", async () => {
		render(
			<MemoryRouter initialEntries={["/booking-history"]}>
				<AuthContext.Provider
					value={{
						user: { id: "1", email: "test@example.com", profile_picture: "" },
						logout: vi.fn(),
					}}
				>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		await waitFor(() => {
			expect(screen.getByText(/Booking History Page/i)).toBeInTheDocument();
		});
	});

	test("renders Validation page for /validation route", async () => {
		render(
			<MemoryRouter initialEntries={["/validation"]}>
				<AuthContext.Provider
					value={{
						user: { id: "1", email: "test@example.com", profile_picture: "" },
						logout: vi.fn(),
					}}
				>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		await waitFor(() => {
			expect(screen.getByText(/Validation Page/i)).toBeInTheDocument();
		});
	});

	test("renders OwnerDashboard when sessionType is Owner", async () => {
		sessionStorage.setItem("sessionType", "Owner");
		render(
			<MemoryRouter initialEntries={["/ownerdashboard"]}>
				<AuthContext.Provider
					value={{
						user: { id: "1", email: "test@example.com", profile_picture: "" },
						logout: vi.fn(),
					}}
				>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		await waitFor(() => {
			expect(screen.getByText(/Owner Dashboard Page/i)).toBeInTheDocument();
		});
	});

	test("renders loading when user is not available", () => {
		render(
			<MemoryRouter>
				<AuthContext.Provider value={{ user: null, logout: vi.fn() }}>
					<AppLayout />
				</AuthContext.Provider>
			</MemoryRouter>
		);
		expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
	});
});
