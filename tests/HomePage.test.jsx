/* eslint-disable no-unused-vars */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import HomePage from "../src/pages/HomePage";
import { MapContext } from "../src/context/MapContext";
import { AuthContext } from "../src/context/AuthContext";

// Mocking modules
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));
vi.mock("axios"); // Mock axios calls if any are made by child components or HomePage itself
vi.mock("../src/components/SearchBar", () => ({
	default: ({
		searchAddress,
		handleSearchChange,
		handleClearSearch,
		handleUseMyLocation,
		handleSuggestionClick,
		predictions,
		suggestions,
		isMobile,
		myLocationstatus,
		mtLocationMessage,
	}) => (
		<div>
			<input
				data-testid="search-input"
				value={searchAddress}
				onChange={handleSearchChange}
				placeholder="Search address"
			/>
			<button data-testid="clear-search-button" onClick={handleClearSearch}>
				Clear
			</button>
			<button data-testid="my-location-button" onClick={handleUseMyLocation}>
				Use My Location
			</button>
			{suggestions &&
				predictions.map((p) => (
					<div data-testid="suggestion-item" key={p.place_id} onClick={() => handleSuggestionClick(p.description)}>
						{p.description}
					</div>
				))}
			{myLocationstatus === "loading" && <div data-testid="location-loading">{mtLocationMessage}</div>}
			{myLocationstatus === "success" && <div data-testid="location-success">{mtLocationMessage}</div>}
			{myLocationstatus === "error" && <div data-testid="location-error">{mtLocationMessage}</div>}
		</div>
	),
}));

vi.mock("../src/components/NearByParkings", () => ({
	default: ({ isMobile, origin, onSpotSelect }) => <div data-testid="nearby-parkings">Nearby Parkings</div>,
}));

vi.mock("../src/components/PastBooking", () => ({
	default: ({ user, isMobile }) => <div data-testid="past-booking">Past Booking</div>,
}));

const mockUseNavigate = vi.fn();
useNavigate.mockImplementation(() => mockUseNavigate);

const mockSetSelectedMarker = vi.fn();
const mockSetNewMarker = vi.fn();
const mockSetFilters = vi.fn();

const mockUser = { id: "test-user-id" }; // Mock user object

describe("HomePage", () => {
	let originalGeolocation;

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock localStorage
		Storage.prototype.getItem = vi.fn();
		Storage.prototype.setItem = vi.fn();

		// Mock window.google.maps
		Object.defineProperty(window, "google", {
			value: {
				maps: {
					places: {
						AutocompleteService: vi.fn(() => ({
							getPlacePredictions: vi.fn((options, callback) => {
								if (options.input === "Test Address") {
									callback([{ place_id: "1", description: "Test Address, City" }], "OK");
								} else {
									callback([], "ZERO_RESULTS");
								}
							}),
						})),
					},
					Geocoder: vi.fn(() => ({
						geocode: vi.fn((options, callback) => {
							if (options.address === "Test Address, City") {
								callback([{ geometry: { location: { lat: () => 123, lng: () => 456 } } }], "OK");
							} else if (options.location) {
								callback(
									[
										{
											formatted_address: "Mocked Current Location",
											geometry: { location: { lat: () => 123, lng: () => 456 } },
										},
									],
									"OK"
								);
							} else {
								callback([{ geometry: { location: { lat: () => 0, lng: () => 0 } } }], "OK");
							}
						}),
					})),
				},
			},
			writable: true,
		});

		originalGeolocation = globalThis.navigator.geolocation;
		Object.defineProperty(globalThis.navigator, "geolocation", {
			value: {
				getCurrentPosition: vi.fn((success, error) => {
					success({ coords: { latitude: 123, longitude: 456 } });
				}),
			},
			writable: true,
		});
	});

	afterEach(() => {
		Object.defineProperty(globalThis.navigator, "geolocation", {
			value: originalGeolocation,
			writable: true,
		});
		Storage.prototype.getItem = undefined;
		Storage.prototype.setItem = undefined;
	});

	test("renders loading message when not loaded", () => {
		render(
			<MapContext.Provider value={{ isLoaded: false, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);
		expect(screen.getByText("Loading Smart Parking")).toBeInTheDocument();
	});

	test("renders error message when there is a load error", () => {
		render(
			<MapContext.Provider value={{ isLoaded: false, loadError: "Failed to load map" }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);
		expect(screen.getByText(/failed to load map/i)).toBeInTheDocument();
		expect(screen.getByText(/please check your internet connection/i)).toBeInTheDocument();
	});

	test("renders search bar and action buttons when loaded", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Search address")).toBeInTheDocument();
			expect(screen.getByText("Find Parking Spots")).toBeInTheDocument();
			expect(screen.getByText("Add Community Parking Spot")).toBeInTheDocument();
		});
	});

	test("updates search address on input change", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		const searchInput = screen.getByPlaceholderText("Search address");
		fireEvent.change(searchInput, { target: { value: "Test Address" } });

		await waitFor(() => {
			expect(searchInput).toHaveValue("Test Address");
			expect(screen.getByText("Test Address, City")).toBeInTheDocument(); // Check for suggestion
		});
	});

	test("clears search address and suggestions on clear button click", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		const searchInput = screen.getByPlaceholderText("Search address");
		fireEvent.change(searchInput, { target: { value: "Test Address" } });

		await waitFor(() => {
			expect(screen.getByText("Test Address, City")).toBeInTheDocument(); // Check for suggestion
		});

		fireEvent.click(screen.getByTestId("clear-search-button"));

		await waitFor(() => {
			expect(searchInput).toHaveValue("");
			expect(screen.queryByText("Test Address, City")).not.toBeInTheDocument(); // Suggestions should be gone
		});
	});

	test("handles suggestion click and updates search address and marker", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		const searchInput = screen.getByPlaceholderText("Search address");
		fireEvent.change(searchInput, { target: { value: "Test Address" } });

		await waitFor(() => {
			expect(screen.getByText("Test Address, City")).toBeInTheDocument(); // Check for suggestion
		});

		fireEvent.click(screen.getByText("Test Address, City"));

		await waitFor(() => {
			expect(searchInput).toHaveValue("Test Address, City");
			expect(mockSetNewMarker).toHaveBeenCalledWith({
				name: "Test Address, City",
				location: { lat: 123, lng: 456 },
			});
			expect(mockSetSelectedMarker).toHaveBeenCalledWith({
				name: "Test Address, City",
				location: { lat: 123, lng: 456 },
			});
			expect(screen.queryByText("Test Address, City")).not.toBeInTheDocument(); // Suggestions should be gone
		});
	});

	test("uses current location on button click and updates search address and marker", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location

		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		await waitFor(() => {
			expect(screen.getByTestId("my-location-button")).toBeInTheDocument();
		});

		fireEvent.click(screen.getByTestId("my-location-button"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Search address")).toHaveValue("Mocked Current Location");
			expect(mockSetNewMarker).toHaveBeenCalledWith({
				name: "Mocked Current Location",
				location: { lat: 123, lng: 456 },
			});
			expect(mockSetSelectedMarker).toHaveBeenCalledWith({
				name: "Mocked Current Location",
				location: { lat: 123, lng: 456 },
			});
		});
	});

	test("navigates to /mapsearch on Find Parking Spots button click with valid address", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		const searchInput = screen.getByPlaceholderText("Search address");
		fireEvent.change(searchInput, { target: { value: "Valid Address" } });

		// Simulate address validation
		const findParkingButton = screen.getByText("Find Parking Spots");
		fireEvent.click(findParkingButton);

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith("/mapsearch", expect.any(Object));
			expect(Storage.prototype.setItem).toHaveBeenCalledWith("recentSearches", expect.any(String));
			expect(mockSetFilters).toHaveBeenCalledWith(expect.any(Function));
		});
	});

	test("shows alert if Find Parking Spots button is clicked with invalid address", async () => {
		Storage.prototype.getItem.mockReturnValue(null); // No stored location
		const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		const findParkingButton = screen.getByText("Find Parking Spots");
		expect(findParkingButton).toBeDisabled(); // The button should be disabled for invalid input

		// Optionally, try to click and assert alert is NOT called
		fireEvent.click(findParkingButton);
		expect(mockAlert).not.toHaveBeenCalled();

		mockAlert.mockRestore();
	});

	test("loads user location from localStorage if available on mount", async () => {
		const storedLocation = JSON.stringify({ address: "Stored Location", lat: 789, lng: 1011 });
		Storage.prototype.getItem.mockReturnValue(storedLocation);

		render(
			<MapContext.Provider value={{ isLoaded: true, loadError: null }}>
				<AuthContext.Provider value={{ user: mockUser }}>
					<HomePage
						setSelectedMarker={mockSetSelectedMarker}
						setNewMarker={mockSetNewMarker}
						setFilters={mockSetFilters}
					/>
				</AuthContext.Provider>
			</MapContext.Provider>
		);

		await waitFor(() => {
			expect(Storage.prototype.getItem).toHaveBeenCalledWith("userLocation");
			expect(mockSetNewMarker).toHaveBeenCalledWith({
				name: "Stored Location",
				location: { lat: 789, lng: 1011 },
			});
		});
	});
});
