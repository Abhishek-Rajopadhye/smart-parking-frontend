import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import { AuthContext } from "../src/context/AuthContext";
import { EditReview } from "../src/components/EditReview";

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
		Rating: ({ value, onChange }) => (
			<input data-testid="rating" type="number" value={value} onChange={onChange} min={1} max={5} />
		),
		Box: ({ children }) => <div>{children}</div>,
	};
});

const mockUser = {
	id: "user1",
	name: "Test User",
	profile_picture: "",
};

const mockReview = {
	id: "review1",
	user_id: "user1",
	reviewer_name: "Test User",
	user_profile_picture: "",
	rating_score: 4,
	review_description: "Nice place",
	created_at: "2024-04-28T10:00:00Z",
};

describe("EditReview", () => {
	test("renders dialog and submits edited review", async () => {
		const handleClose = vi.fn();
		const handleSave = vi.fn();

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<EditReview openDialog={true} onClose={handleClose} review={mockReview} handleSave={handleSave} />
			</AuthContext.Provider>
		);

		expect(screen.getByTestId("dialog")).toBeInTheDocument();

		// Edit review description
		const reviewInput = screen.getByLabelText(/review/i);
		fireEvent.change(reviewInput, { target: { value: "Updated review!" } });

		// Edit rating
		const ratingInput = screen.getByTestId("rating");
		fireEvent.change(ratingInput, { target: { value: 5 } });

		// Submit edited review
		fireEvent.click(screen.getByText(/submit/i));

		await waitFor(() => {
			expect(handleSave).toHaveBeenCalledWith(
				expect.objectContaining({
					review_description: "Updated review!",
					rating_score: 5,
				})
			);
		});
	});

	test("calls onClose when Close button is clicked", () => {
		const handleClose = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<EditReview openDialog={true} onClose={handleClose} review={mockReview} handleSave={vi.fn()} />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Close"));
		expect(handleClose).toHaveBeenCalled();
	});
});
