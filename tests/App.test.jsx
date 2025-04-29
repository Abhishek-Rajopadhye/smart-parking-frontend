import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import App from "../src/App";

// Mock all providers and pages used in App.jsx
vi.mock("../src/context/AuthContext", () => ({
	AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));
vi.mock("../src/context/MapContext", () => ({
	MapProvider: ({ children }) => <div data-testid="map-provider">{children}</div>,
}));
vi.mock("../src/style/AppTheme", () => ({
	default: {},
}));
vi.mock("@mui/material/styles", () => ({
	ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));
vi.mock("../src/pages/Login", () => ({
	Login: () => <div>Login Page</div>,
}));
vi.mock("../src/AppLayout", () => ({
	default: () => <div>AppLayout Page</div>,
}));

describe("App", () => {
	test('renders Login page for "/" route', async () => {
		window.history.pushState({}, "Login", "/");
		render(<App />);
		await waitFor(() => {
			expect(screen.getByText("Login Page")).toBeInTheDocument();
		});
	});

	test("renders AppLayout for any other route", async () => {
		window.history.pushState({}, "Home", "/homepage");
		render(<App />);
		await waitFor(() => {
			expect(screen.getByText("AppLayout Page")).toBeInTheDocument();
		});
	});
});
