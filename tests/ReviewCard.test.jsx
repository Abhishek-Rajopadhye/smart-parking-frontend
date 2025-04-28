import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import { ReviewCard } from "../src/components/ReviewCard";
import { AuthContext } from "../src/context/AuthContext";

// Mock MUI components
vi.mock("@mui/material", async () => {
	const actual = await vi.importActual("@mui/material");
	return {
		...actual,
		Card: ({ children }) => <div data-testid="card">{children}</div>,
		CardHeader: ({ avatar, title, subheader }) => (
			<div data-testid="card-header">
				{avatar}
				<div>{title}</div>
				<div>{subheader}</div>
			</div>
		),
		CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
		CardActions: ({ children }) => <div data-testid="card-actions">{children}</div>,
		CardMedia: ({ image, ...props }) => <img data-testid="card-media" src={image} alt="review-img" {...props} />,
		Typography: ({ children }) => <span>{children}</span>,
		Avatar: ({ alt, src }) => <img data-testid="avatar" alt={alt} src={src} />,
		Button: ({ children, ...props }) => (
			<button {...props} type="button">
				{children}
			</button>
		),
		Box: ({ children }) => <div>{children}</div>,
		Rating: ({ value }) => <div data-testid="rating">{value}</div>,
		Dialog: ({ open, children, onClose }) =>
			open ? (
				<div data-testid="dialog">
					{children}
					<button onClick={onClose}>Close</button>
				</div>
			) : null,
	};
});

// Mock ConfirmationDialogBox and EditReview
vi.mock("../src/components/ConfirmationDialogBox", () => ({
	ConfirmationDialogBox: ({ open, message, onConfirm, onCancel }) =>
		open ? (
			<div data-testid="confirmation-dialog">
				<span>{message}</span>
				<button onClick={onConfirm}>Confirm</button>
				<button onClick={onCancel}>Cancel</button>
			</div>
		) : null,
}));
vi.mock("../src/components/EditReview", () => ({
	EditReview: ({ openDialog, onClose, review, handleSave }) =>
		openDialog ? (
			<div data-testid="edit-review-dialog">
				<button onClick={() => handleSave({ ...review, review_description: "Edited!" })}>Save Review</button>
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
}));

const mockUser = {
	id: "user1",
	name: "Test User",
	profile_picture: "",
};

const mockReview = {
	id: "review1",
	user_id: "user1",
	spot_owner_id: "owner1",
	reviewer_name: "Test User",
	user_profile_picture: "",
	rating_score: 4.5,
	review_description: "Great spot!",
	created_at: "2024-04-28T10:00:00Z",
	images: ["base64img1", "base64img2"],
};

describe("ReviewCard", () => {
	test("renders review details and images", () => {
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={vi.fn()} handleEditReview={vi.fn()} />
			</AuthContext.Provider>
		);
		expect(screen.getByText("Test User")).toBeInTheDocument();
		expect(screen.getByText("Great spot!")).toBeInTheDocument();
		expect(screen.getByTestId("rating")).toHaveTextContent("4.5");
		expect(screen.getAllByTestId("card-media").length).toBe(2);
	});

	test("shows Edit and Delete buttons for review owner", () => {
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={vi.fn()} handleEditReview={vi.fn()} />
			</AuthContext.Provider>
		);
		expect(screen.getByText("Edit")).toBeInTheDocument();
		expect(screen.getByText("Delete")).toBeInTheDocument();
	});

	test("shows Reply button for spot owner", () => {
		const ownerUser = { ...mockUser, id: "owner1" };
		render(
			<AuthContext.Provider value={{ user: ownerUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={vi.fn()} handleEditReview={vi.fn()} />
			</AuthContext.Provider>
		);
		expect(screen.getByText("Reply")).toBeInTheDocument();
	});

	test("opens and closes image dialog", () => {
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={vi.fn()} handleEditReview={vi.fn()} />
			</AuthContext.Provider>
		);
		// Click on the first image
		fireEvent.click(screen.getAllByTestId("card-media")[0]);
		expect(screen.getByTestId("dialog")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Close"));
		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
	});

	test("opens and confirms delete dialog", async () => {
		const handleDeleteReview = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={handleDeleteReview} handleEditReview={vi.fn()} />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Confirm"));
		await waitFor(() => {
			expect(handleDeleteReview).toHaveBeenCalled();
		});
	});

	test("opens and saves edit review dialog", async () => {
		const handleEditReview = vi.fn();
		render(
			<AuthContext.Provider value={{ user: mockUser }}>
				<ReviewCard review={mockReview} handleDeleteReview={vi.fn()} handleEditReview={handleEditReview} />
			</AuthContext.Provider>
		);
		fireEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("edit-review-dialog")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Save Review"));
		await waitFor(() => {
			expect(handleEditReview).toHaveBeenCalledWith(expect.objectContaining({ review_description: "Edited!" }));
		});
	});
});
