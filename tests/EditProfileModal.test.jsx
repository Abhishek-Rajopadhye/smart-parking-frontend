import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import { AuthContext } from "../src/context/AuthContext";
import { EditProfileModal } from "../src/components/EditProfileModal";

// Mock MUI components
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		Dialog: ({ open, children, onClose }) =>
			open ? (
				<div data-testid="dialog">
					{children}
					<button onClick={onClose}>Close</button>
				</div>
			) : null,
		Button: ({ children, ...props }) => (
			<button {...props} type="button">
				{children}
			</button>
		),
		TextField: ({ label, value, onChange, ...props }) => (
			<input aria-label={label} value={value} onChange={onChange} {...props} />
		),
		Box: ({ children }) => <div>{children}</div>,
	};
});

const mockUser = {
	id: "user1",
	name: "Test User",
	email: "test@example.com",
	phone: "1234567890",
	profile_picture: "https://lh3.googleusercontent.com/a/ACg8ocJNzzn9l7Fec2eOaEZwiWFRjeLBEc_IyLLy-0ql_g9Yw9oHiA=s96-c",
};

describe("EditProfileModal", () => {
	test("renders dialog and submits edited profile", async () => {
		const handleClose = vi.fn();
		const handleSave = vi.fn();

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<EditProfileModal open={true} handleClose={handleClose} user={mockUser} handleSave={handleSave} />
			</AuthContext.Provider>
		);
		await waitFor(() => {
			expect(screen.getByTestId("dialog")).toBeInTheDocument();
		});

		// Edit name
		const nameInput = screen.getByLabelText(/name/i);
		fireEvent.change(nameInput, { target: { value: "Updated Name" } });

		// Edit phone
		const phoneInput = screen.getByLabelText(/phone/i);
		fireEvent.change(phoneInput, { target: { value: "9876543210" } });

		// Submit edited profile
		fireEvent.click(screen.getByText("Save"));

		await waitFor(() => {
			expect(handleSave).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Updated Name",
					phone: "9876543210",
				})
			);
		});
	});

	test("calls onClose when Close button is clicked", () => {
		const handleClose = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<EditProfileModal open={true} handleClose={handleClose} user={mockUser} handleSave={vi.fn()} />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Close"));
		expect(handleClose).toHaveBeenCalled();
	});
});
