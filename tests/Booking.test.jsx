
import React from 'react';
import { render, screen, waitFor, describe, test, expect, beforeEach, afterEach, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import jest from "jest";
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Booking } from '../src/pages/Booking';
import { AuthContext } from "../src/context/AuthContext";

// Mocking modules
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('jspdf', () => {
  return function() {
    this.save = jest.fn();
    this.output = jest.fn(() => new Blob()); // Mock output to return a Blob
    this.setFontSize = jest.fn();
    this.setTextColor = jest.fn();
    this.setFont = jest.fn();
    this.text = jest.fn();
    this.setFillColor = jest.fn();
    this.rect = jest.fn();
    this.splitTextToSize = jest.fn(text => text.split('\n')); // Mock splitTextToSize
  };
});
// Mock window.fetch
globalThis.fetch = jest.fn();


const mockSpotInformation = {
  spot_id: 1,
  hourly_rate: 100,
  open_time: '09:00 AM',
  close_time: '06:00 PM',
  available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  spot_title: 'Test Parking Spot',
  address: '123 Test Street',
};

const mockUser = {
    id: 'test-user-id',
    email: 'test-user@example.com'
};

const mockSetDialog = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockUseNavigate,
}));


describe('Booking', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mocking Date to control time in tests
        const mockDate = new Date('2023-10-27T10:00:00Z'); // Friday
        jest.spyOn(globalThis, 'Date').mockImplementation(() => mockDate);

        // Mock Razorpay script loading
        Object.defineProperty(window, 'Razorpay', {
          value: jest.fn(),
          writable: true,
        });
        globalThis.fetch.mockResolvedValue({
          json: () => Promise.resolve({}),
        });
    });

    afterEach(() => {
        jest.spyOn(globalThis, 'Date').mockRestore();
    });


    test('renders with initial state', () => {
        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

        expect(screen.getByText('🚗 Book Parking Spot')).toBeInTheDocument();
        expect(screen.getByLabelText('Total Slots')).toHaveValue(1);
        expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
        expect(screen.getByLabelText('End Time')).toBeInTheDocument();
    });

    test('allows changing total slots', () => {
        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

        const totalSlotsInput = screen.getByLabelText('Total Slots');
        fireEvent.change(totalSlotsInput, { target: { value: '5' } });
        expect(totalSlotsInput).toHaveValue(5);
    });


    test('shows total amount dialog on calculateAmount click with valid times', async () => {
        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

         // Set the values using fireEvent for DateTimePickers (simulating user interaction)
        const startTimeInput = screen.getByLabelText('Start Time');
        fireEvent.change(startTimeInput, { target: { value: '10/27/2023 10:00 AM' } });

        const endTimeInput = screen.getByLabelText('End Time');
        fireEvent.change(endTimeInput, { target: { value: '10/27/2023 12:00 PM' } });


        fireEvent.click(screen.getByText('Book Spot'));

        await waitFor(() => {
            expect(screen.getByText('Total Amount')).toBeInTheDocument();
            expect(screen.getByText('You need to pay ₹200')).toBeInTheDocument(); // 2 hours * 100/hr * 1 slot
        });
    });


    test('shows snackbar for invalid time range', async () => {
        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

         // Mocking invalid start and end times (end before start)
         const startTimeInput = screen.getByLabelText('Start Time');
         fireEvent.change(startTimeInput, { target: { value: '10/27/2023 12:00 PM' } });

         const endTimeInput = screen.getByLabelText('End Time');
         fireEvent.change(endTimeInput, { target: { value: '10/27/2023 10:00 AM' } });


        fireEvent.click(screen.getByText('Book Spot'));

        await waitFor(() => {
            expect(screen.getByText('Enter a valid time.')).toBeInTheDocument();
        });
    });

    test('shows snackbar for total slots less than or equal to 0', async () => {
      render(
          <LocalizationProvider dateAdapter={AdapterDateFns}>
              <AuthContext.Provider value={{ user: mockUser }}>
                  <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
              </AuthContext.Provider>
          </LocalizationProvider>
      );

      const totalSlotsInput = screen.getByLabelText('Total Slots');
      fireEvent.change(totalSlotsInput, { target: { value: '0' } });

      const startTimeInput = screen.getByLabelText('Start Time');
      fireEvent.change(startTimeInput, { target: { value: '10/27/2023 10:00 AM' } });

      const endTimeInput = screen.getByLabelText('End Time');
      fireEvent.change(endTimeInput, { target: { value: '10/27/2023 12:00 PM' } });


      fireEvent.click(screen.getByText('Book Spot'));

      await waitFor(() => {
          expect(screen.getByText('Total slot can not be negative')).toBeInTheDocument();
      });
    });

    test('calls set_dialog on Cancel button click', () => {
        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockSetDialog).toHaveBeenCalled();
    });

    test('processes payment successfully', async () => {
        // Mock Razorpay open method
        const mockRazorpayOpen = jest.fn();
        window.Razorpay.mockImplementation((options) => {
          options.handler({
            razorpay_order_id: 'mock-order-id',
            razorpay_payment_id: 'mock-payment-id',
            razorpay_signature: 'mock-signature',
          });
          return {
            open: mockRazorpayOpen,
          };
        });

        axios.post.mockResolvedValueOnce({ // Mock book-spot call
          status: 200,
          data: {
            order_id: 'mock-order-id',
            amount: 200,
            currency: 'INR',
            payment_id: 'mock-payment-id-from-backend'
          }
        }).mockResolvedValueOnce({ // Mock update-payment-status call
          status: 200,
        });

        globalThis.fetch.mockResolvedValue({ // Mock PDF email send
            json: () => Promise.resolve({}),
        });


        render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthContext.Provider value={{ user: mockUser }}>
                    <Booking spot_information={mockSpotInformation} open={true} set_dialog={mockSetDialog} />
                </AuthContext.Provider>
            </LocalizationProvider>
        );

        const startTimeInput = screen.getByLabelText('Start Time');
        fireEvent.change(startTimeInput, { target: { value: '10/27/2023 10:00 AM' } });

        const endTimeInput = screen.getByLabelText('End Time');
        fireEvent.change(endTimeInput, { target: { value: '10/27/2023 12:00 PM' } });

        fireEvent.click(screen.getByText('Book Spot'));

        await waitFor(() => {
             expect(screen.getByText('Total Amount')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('OK')); // Click OK on the total amount dialog

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledTimes(2); // book-spot and update-payment-status
          expect(mockRazorpayOpen).toHaveBeenCalled();
          expect(screen.getByText('Booking successfully and Receipt sent to your register email and redirect to booking history!')).toBeInTheDocument();
          expect(mockUseNavigate).toHaveBeenCalledWith('/booking-history');
        });
    });
});
