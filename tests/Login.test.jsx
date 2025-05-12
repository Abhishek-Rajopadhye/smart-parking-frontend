import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { Login } from "../src/pages/Login";
import { AuthContext } from "../src/context/AuthContext";

// Mocking AuthContext
const mockLogin = vi.fn();

const mockAuthContextValue = {
	login: mockLogin,
};

describe("Login", () => {
	test("renders login page with title and both login buttons", () => {
		render(
			<AuthContext.Provider value={mockAuthContextValue}>
				<Login />
			</AuthContext.Provider>
		);

		expect(screen.getByText("Welcome to BookMy Parking")).toBeInTheDocument();
		expect(screen.getByText("Please log in to continue")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Login as User/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Login as Owner/i })).toBeInTheDocument();
	});

	test('calls login function with "google" and sets sessionType to "User" when "Login as User" is clicked', () => {
		render(
			<AuthContext.Provider value={mockAuthContextValue}>
				<Login />
			</AuthContext.Provider>
		);

		fireEvent.click(screen.getByRole("button", { name: /Login as User/i }));
		expect(mockLogin).toHaveBeenCalledWith("google");
		expect(sessionStorage.getItem("sessionType")).toBe("User");
	});

	test('calls login function with "google" and sets sessionType to "Owner" when "Login as Owner" is clicked', () => {
		render(
			<AuthContext.Provider value={mockAuthContextValue}>
				<Login />
			</AuthContext.Provider>
		);

		fireEvent.click(screen.getByRole("button", { name: /Login as Owner/i }));
		expect(mockLogin).toHaveBeenCalledWith("google");
		expect(sessionStorage.getItem("sessionType")).toBe("Owner");
	});
});
