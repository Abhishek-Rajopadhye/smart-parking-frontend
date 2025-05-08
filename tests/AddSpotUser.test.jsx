import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { AddSpotUser } from "../src/pages/AddSpotUser";
import { AuthContext } from "../src/context/AuthContext";
import { MapContext } from "../src/context/MapContext";

// Mock MUI components
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		TextField: ({ label, value, onChange, ...props }) => (
			<input aria-label={label} value={value} onChange={onChange} {...props} />
		),
		Button: ({ children, onClick, ...props }) => (
			<button onClick={onClick} {...props}>
				{children}
			</button>
		),
		Stepper: ({ children }) => <div>{children}</div>,
		Step: ({ children }) => <div>{children}</div>,
		StepLabel: ({ children }) => <div>{children}</div>,
		Typography: ({ children }) => <div>{children}</div>,
		Grid: ({ children }) => <div>{children}</div>,
		Box: ({ children }) => <div>{children}</div>,
		Snackbar: ({ open, children }) => (open ? <div>{children}</div> : null),
		Alert: ({ severity, children }) => (
			<div>
				{severity}: {children}
			</div>
		),
		Stack: ({ children }) => <div>{children}</div>,
		IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
	};
});
vi.mock("@mui/icons-material/Delete", () => ({ default: () => <span>DeleteIcon</span> }));
vi.mock("@mui/icons-material/LocationOn", () => ({ default: () => <span>LocationOnIcon</span> }));
vi.mock("../components/MapDialog", () => ({
	default: ({ open, onClose, onSave }) =>
		open ? (
			<div data-testid="map-dialog">
				<button onClick={() => onSave({ lat: 10, lng: 20 }, "success")}>Save Location</button>
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
}));

vi.mock("axios");

describe("AddSpotUser Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	const mockUser = {
		_id: "12345",
		name: "John Doe",
	};

	test("renders stepper and form fields", () => {
		render(
			<MapContext.Provider value={{ isLoaded: true }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<AddSpotUser />
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		expect(screen.getByText(/Add a Parking Spot/i)).toBeInTheDocument();
		expect(screen.getByText("Instruction")).toBeInTheDocument();
		expect(screen.getByText(/Spot Details/i)).toBeInTheDocument();
		expect(screen.getByText(/Instructions & Submit/i)).toBeInTheDocument();
		expect(screen.getByText(/Next/i)).toBeInTheDocument();
	});

	test("shows error if required fields are missing on submit", async () => {
		render(
			<MapContext.Provider value={{ isLoaded: true }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<AddSpotUser />
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		// Go to Spot Details step
		fireEvent.click(screen.getByText(/Next/i));
        fireEvent.click(screen.getByText(/Next/i));
		await waitFor(() => {
			expect(screen.getByText(/Spot Title is required/i)).toBeInTheDocument();
		});
	});

});
