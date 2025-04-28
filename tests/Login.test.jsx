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
	test("renders login page with title and button", () => {
		render(
			<AuthContext.Provider value={mockAuthContextValue}>
				<Login />
			</AuthContext.Provider>
		);

		expect(screen.getByText("Welcome to Smart Parking")).toBeInTheDocument();
		expect(screen.getByText("Please log in to continue")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Login with Google/i })).toBeInTheDocument();
	});

	test('calls login function with "google" when button is clicked', () => {
		render(
			<AuthContext.Provider value={mockAuthContextValue}>
				<Login />
			</AuthContext.Provider>
		);

		fireEvent.click(screen.getByRole("button", { name: /Login with Google/i }));
		expect(mockLogin).toHaveBeenCalledWith("google");
	});
});
