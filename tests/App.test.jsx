/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, waitFor, describe, test, expect, beforeEach, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import jest from "jest";
import { useEffect } from 'react';
import { MemoryRouter} from 'react-router-dom';
import AppLayout from '../src/App'; // Assuming AppLayout is the default export or can be imported like this
import { AuthContext } from "../src/context/AuthContext";

// Mocking components used in AppLayout
jest.mock('../../context/AuthContext', () => ({
  AuthContext: React.createContext({
    user: { id: 'test-user-id', profile_picture: 'test.jpg', email: 'test@example.com' },
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>, // Mock AuthProvider
}));

jest.mock('../../context/MapContext', () => ({
  MapContext: React.createContext({
    isLoaded: true,
    loadError: null,
  }),
  MapProvider: ({ children }) => <div>{children}</div>, // Mock MapProvider
}));

jest.mock('../pages/Login', () => ({ Login: () => <div>Login Page</div> }));
jest.mock('../pages/Profile', () => ({ Profile: () => <div>Profile Page</div> }));
jest.mock('../pages/BookingHistory', () => ({ BookingHistory: () => <div>Booking History Page</div> }));
jest.mock('../pages/Auth', () => ({ Auth: () => <div>Auth Page</div> }));
jest.mock('../pages/Spot', () => ({ Spot: () => <div>Add Spot Page</div> }));
jest.mock('../pages/HomePage', () => ({
    __esModule: true,
    default: ({ setSelectedMarker, setNewMarker, newMarker, setFilters }) => (
        <div data-testid="homepage">
            Home Page
            <button onClick={() => setFilters({ available_days: ['Mon'] })}>Set Filter</button>
        </div>
    ),
}));
jest.mock('../pages/MapSearch', () => ({
    __esModule: true,
    default: ({ selectedMarker, setSelectedMarker, newMarker, setNewMarker, markers, setMarkers, mapRef, filteredMarkers, setFilters }) => (
        <div>Map Search Page - Filtered Markers Count: {filteredMarkers.length}</div>
    ),
}));
jest.mock('../pages/Validation', () => ({ Validation: () => <div>Validation Page</div> }));
jest.mock('../components/DetailInfo', () => ({
    __esModule: true,
    default: () => <div>Detail Info Page</div>
}));


describe('AppLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear localStorage before each test
        localStorage.clear();
    });


    test('renders CircularProgress when user is not available', () => {
        const mockAuthContextValue = { user: null, logout: jest.fn() };
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <MemoryRouter initialEntries={['/homepage']}>
                     <AppLayout />
                </MemoryRouter>
            </AuthContext.Provider>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });


    test('renders AppBar and content when user is available', async () => {
        render(
             <MemoryRouter initialEntries={['/homepage']}>
                <AppLayout />
            </MemoryRouter>
        );

        await waitFor(() => {
             expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
             expect(screen.getByText('Home')).toBeInTheDocument(); // Page Title
             expect(screen.getByAltText('Avatar')).toBeInTheDocument(); // Avatar
             expect(screen.getByTestId('homepage')).toBeInTheDocument(); // HomePage content
        });
    });


    test('navigates to different routes from the menu', async () => {
        render(
            <MemoryRouter initialEntries={['/homepage']}>
                 <AppLayout />
            </MemoryRouter>
        );

        // Open the menu
        fireEvent.click(screen.getByAltText('Avatar'));

        // Click on Profile
        fireEvent.click(screen.getByText('Profile'));

        await waitFor(() => {
            expect(screen.getByText('Profile Page')).toBeInTheDocument();
             expect(screen.getByText('Profile')).toBeInTheDocument(); // Page Title
        });


        // Open the menu again
        fireEvent.click(screen.getByAltText('Avatar'));

        // Click on My Bookings
        fireEvent.click(screen.getByText('My Bookings'));

        await waitFor(() => {
             expect(screen.getByText('Booking History Page')).toBeInTheDocument();
             expect(screen.getByText('My Bookings')).toBeInTheDocument(); // Page Title
        });
    });


    test('shows "Verify Spot Requests" menu item for admin user', async () => {
        const adminUser = { id: 'admin-user-id', profile_picture: 'admin.jpg', email: 'abhishek.rajopadhye21@gmail.com' };
        const mockAuthContextValue = { user: adminUser, logout: jest.fn() };

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <MemoryRouter initialEntries={['/homepage']}>
                     <AppLayout />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByAltText('Avatar')); // Open the menu

        await waitFor(() => {
             expect(screen.getByText('Verify Spot Requests')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Verify Spot Requests'));

         await waitFor(() => {
             expect(screen.getByText('Validation Page')).toBeInTheDocument();
         });
    });


    test('hides "Verify Spot Requests" menu item for non-admin user', async () => {
        render(
            <MemoryRouter initialEntries={['/homepage']}>
                <AppLayout />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByAltText('Avatar')); // Open the menu

        await waitFor(() => {
            expect(screen.queryByText('Verify Spot Requests')).not.toBeInTheDocument();
        });
    });


    test('calls logout and navigates to "/" on Logout click', async () => {
        const mockLogout = jest.fn();
         const mockAuthContextValue = { user: { id: 'test-user-id', profile_picture: 'test.jpg', email: 'test@example.com' }, logout: mockLogout };

        render(
             <AuthContext.Provider value={mockAuthContextValue}>
                <MemoryRouter initialEntries={['/homepage']}>
                     <AppLayout />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByAltText('Avatar')); // Open the menu
        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
             expect(mockLogout).toHaveBeenCalled();
             // Since we are using MemoryRouter, we can check the location change
             expect(screen.getByText('Login Page')).toBeInTheDocument(); // Check if it navigates to the Login page
        });
    });


    test('back and home buttons navigate correctly', async () => {
        render(
             <MemoryRouter initialEntries={['/profile']}>
                 <AppLayout />
            </MemoryRouter>
        );

        await waitFor(() => {
             expect(screen.getByText('Profile Page')).toBeInTheDocument();
        });


        // Click Home button
        fireEvent.click(screen.getByLabelText('Home'));

        await waitFor(() => {
            expect(screen.getByTestId('homepage')).toBeInTheDocument();
        });

        // Navigate back to Profile
        fireEvent.click(screen.getByLabelText('Go back'));

        await waitFor(() => {
            expect(screen.getByText('Profile Page')).toBeInTheDocument();
        });
    });

    test('filters markers based on applied filters', async () => {
        // Mock markers with available_days
        const mockMarkers = [
            { id: 1, available_days: ['Mon', 'Tue'] },
            { id: 2, available_days: ['Wed', 'Thu'] },
            { id: 3, available_days: ['Mon', 'Wed'] },
        ];

         jest.mock('../pages/MapSearch', () => ({
            __esModule: true,
            DefaultComponent: ({ selectedMarker, setSelectedMarker, newMarker, setNewMarker, markers, setMarkers, mapRef, filteredMarkers, setFilters }) => {
                // Simulate setting markers when MapSearch mounts (or when markers are fetched)
                useEffect(() => {
                    setMarkers(mockMarkers);
                }, [setMarkers]);

                return (
                    <div>Map Search Page - Filtered Markers Count: {filteredMarkers.length}</div>
                );
            },
        }));


        render(
             <MemoryRouter initialEntries={['/homepage']}>
                 <AppLayout />
            </MemoryRouter>
        );

        // Navigate to MapSearch
        fireEvent.click(screen.getByRole('button', { name: /Find Parking Spots/i }));

        await waitFor(() => {
             expect(screen.getByText('Map Search Page - Filtered Markers Count: 3')).toBeInTheDocument(); // Initially all markers
        });


        // Go back to HomePage to set a filter
        fireEvent.click(screen.getByLabelText('Go back'));

        await waitFor(() => {
             expect(screen.getByTestId('homepage')).toBeInTheDocument();
        });

        // Set a filter on HomePage (mocked button)
        fireEvent.click(screen.getByText('Set Filter'));

        // Navigate back to MapSearch
         fireEvent.click(screen.getByRole('button', { name: /Find Parking Spots/i }));

        await waitFor(() => {
            // Only markers with 'Mon' should be filtered
            expect(screen.getByText('Map Search Page - Filtered Markers Count: 2')).toBeInTheDocument();
        });

    });
});


// Jest test for the main App component (basic rendering and provider check)
describe('App', () => {
    test('renders AppLayout within providers and router', () => {
        render(<AppLayout />); // Render AppLayout directly for simplicity as App just wraps it

        // Check for elements rendered by AppLayout or its children (e.g., AppBar)
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

     test('renders Login page for "/" route', async () => {
        render(
             <MemoryRouter initialEntries={['/']}>
                 <AppLayout /> // Render AppLayout
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });
});

