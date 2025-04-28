/* eslint-disable no-undef */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach } from "vitest";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Auth } from "../src/pages/Auth";
import { AuthContext } from "../src/context/AuthContext";

// Mocking modules
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));
vi.mock("axios");
vi.mock("../src/const", () => ({
	BACKEND_URL: "http://mocked-backend-url",
}));

const mockNavigate = vi.fn();
useNavigate.mockImplementation(() => mockNavigate);

describe("Auth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear localStorage before each test
		localStorage.clear();
	});

	test("renders CircularProgress when user is not available", () => {
		render(
			<AuthContext.Provider value={{ user: null }}>
				<Auth />
			</AuthContext.Provider>
		);

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	test("stores token and user_id and navigates to /homepage when token is present in URL", async () => {
		// Mock window.location.search
		Object.defineProperty(window, "location", {
			value: { search: "?token=test-token&user_id=test-user-id" },
			writable: true,
		});

		axios.put.mockResolvedValue({ status: 200 });

		render(
			<AuthContext.Provider value={{ user: null }}>
				<Auth />
			</AuthContext.Provider>
		);

		await waitFor(() => {
			expect(localStorage.getItem("token")).toBe("test-token");
			expect(localStorage.getItem("user_id")).toBe("test-user-id");
			expect(axios.put).toHaveBeenCalledWith("http://mocked-backend-url/bookings/user/test-user-id");
			expect(mockNavigate).toHaveBeenCalledWith("/homepage");
		});
	});

	test("does not store token or user_id and does not navigate if token is not present in URL", () => {
		// Mock window.location.search
		Object.defineProperty(window, "location", {
			value: { search: "?user_id=test-user-id" },
			writable: true,
		});

		render(
			<AuthContext.Provider value={{ user: null }}>
				<Auth />
			</AuthContext.Provider>
		);

		expect(localStorage.getItem("token")).toBeNull();
		expect(localStorage.getItem("user_id")).toBeNull();
		expect(axios.put).not.toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	test("renders user information when user is available", () => {
		const mockUser = { name: "Test User", profile_picture: "test-pic.jpg" };
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<Auth />
			</AuthContext.Provider>
		);

		expect(screen.getByText("Welcome, Test User!")).toBeInTheDocument();
		expect(screen.getByAltText("Profile")).toHaveAttribute("src", "test-pic.jpg");
	});

	test("renders loading message when user is null and no token in URL", () => {
		Object.defineProperty(window, "location", {
			value: { search: "" },
			writable: true,
		});

		render(
			<AuthContext.Provider value={{ user: null }}>
				<Auth />
			</AuthContext.Provider>
		);

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(screen.queryByText("Welcome, Test User!")).not.toBeInTheDocument();
	});
});
