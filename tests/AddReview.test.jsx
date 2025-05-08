/* eslint-disable no-unused-vars */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import { AuthContext } from "../src/context/AuthContext";
import { AddReview } from "../src/components/AddReview";
import axios from "axios";

vi.mock("axios");
// Mock MUI components
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
		DialogActions: ({ children }) => <div>{children}</div>,
		DialogTitle: ({ children }) => <h2>{children}</h2>,
		DialogContent: ({ children }) => <div>{children}</div>,
		Button: ({ children, disabled, ...props }) => {
			const { startIcon, ...rest } = props; // Remove startIcon
			return (
				<button {...rest} type="button" disabled={disabled}>
					{children}
				</button>
			);
		},
		TextField: ({ label, value, onChange, name = "", ...props }) => {
			const { fullWidth, multiline, ...rest } = props; // Remove fullWidth, multiline
			return (
				<input
					aria-label={label}
					value={value}
					name={name}
					onChange={(e) => {
						onChange &&
							onChange({
								target: {
									value: e.target.value,
									name: name,
								},
							});
					}}
					{...rest}
				/>
			);
		},
		Rating: ({ value, onChange }) => (
			<input
				data-testid="rating"
				type="number"
				value={value}
				name="rating_score"
				onChange={(e) =>
					onChange &&
					onChange({
						target: {
							value: Number(e.target.value),
							name: "rating_score",
						},
					})
				}
				min={1}
				max={5}
			/>
		),
		Box: ({ children }) => <div>{children}</div>,
	};
});

vi.mock("../src/AppLayout", () => ({
	default: () => <div>AppLayout Page</div>,
}));

const mockUser = {
	id: "user1",
	name: "Test User",
	profile_picture: "",
};

describe("AddReview", () => {
	test("renders dialog and submits review", async () => {
		const handleClose = vi.fn();
		const handleSave = vi.fn();
		axios.post.mockResolvedValue({ status: 200 });

		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<AddReview openDialog={true} onClose={handleClose} spot_id={1} />
			</AuthContext.Provider>
		);

		// Should render dialog
		expect(screen.getByTestId("dialog")).toBeInTheDocument();

		// Set rating
		const ratingInput = screen.getByTestId("rating");
		fireEvent.change(ratingInput, { target: { value: 5, name: "rating_score" } });

		// Fill in review description
		const reviewInput = screen.getByLabelText(/review/i);
		fireEvent.change(reviewInput, { target: { value: "Awesome spot!", name: "review_description" } });

		// Submit review
		const submitButton = screen.getByText(/submit review/i);
		fireEvent.click(submitButton);
		await waitFor(() => {
			expect(axios.post).toHaveBeenCalledWith(
				expect.stringContaining("/reviews"),
				expect.objectContaining({
					rating_score: 5,
					review_description: "Awesome spot!",
					images: [],
					spot_id: 1,
					user_id: "user1",
				}),
				expect.any(Object) // headers
			);
		});
	});

	test("calls onClose when Close button is clicked", () => {
		const handleClose = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<AddReview openDialog={true} onClose={handleClose} spotId="spot1" handleSave={vi.fn()} />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Cancel"));
		expect(handleClose).toHaveBeenCalled();
	});
});
