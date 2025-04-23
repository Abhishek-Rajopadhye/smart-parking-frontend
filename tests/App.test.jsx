import React from "react";
import { render, screen, test, describe } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect } from "@jest/globals";
import App from "../src/App";
import { MemoryRouter } from "react-router-dom";

describe("App", () => {
	test("renders login page by default", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<App />
			</MemoryRouter>
		);
		// Adjust the text to match your login page heading or button
		expect(screen.getByText(/login/i)).toBeInTheDocument();
	});

	test("renders homepage after navigation", () => {
		render(
			<MemoryRouter initialEntries={["/homepage"]}>
				<App />
			</MemoryRouter>
		);
		// Adjust the text to match your homepage heading
		expect(screen.getByText(/home/i)).toBeInTheDocument();
	});

	test("shows profile page when navigated", () => {
		render(
			<MemoryRouter initialEntries={["/profile"]}>
				<App />
			</MemoryRouter>
		);
		// Adjust the text to match your profile page
		expect(screen.getByText(/profile/i)).toBeInTheDocument();
	});
});
