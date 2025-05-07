import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import AddSpotUser from "../src/pages/AddSpotUser"; // adjust the path as needed
import { AuthContext } from "../src/context/AuthContext";

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

  test("renders input fields and submit button", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <AddSpotUser />
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/Spot Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
  });

  test("displays error message when no user is present", () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <AddSpotUser />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Please log in first")).toBeInTheDocument();
  });

  test("updates state on input change", () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <AddSpotUser />
      </AuthContext.Provider>
    );

    const nameInput = screen.getByLabelText(/Spot Name/i);
    fireEvent.change(nameInput, { target: { value: "Test Spot" } });
    expect(nameInput.value).toBe("Test Spot");
  });

  test("submits form and calls axios.post with correct data", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <AddSpotUser />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Spot Name/i), {
      target: { value: "Test Spot" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "123 Main St" },
    });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/spots"), 
        expect.objectContaining({
          name: "Test Spot",
          address: "123 Main St",
          userId: "12345",
        })
      );
    });
  });

  test("handles API error gracefully", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <AddSpotUser />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Spot Name/i), {
      target: { value: "Error Spot" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "Error Address" },
    });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
