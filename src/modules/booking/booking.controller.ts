import { Request, Response } from "express";
import { bookingServices } from "./booking.service";


const createBooking = async (req: Request, res: Response) => {
    try {
        const bookingData = req.body;
        const currentUser = req.user;

        // Validate required fields
        const requiredFields = ['customer_id', 'vehicle_id', 'rent_start_date', 'rent_end_date'];
        for (const field of requiredFields) {
            if (!bookingData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`,
                    errors: "All booking fields are required"
                });
            }
        }

        // Customers can only create bookings for themselves
        if (currentUser?.role === "customer" && currentUser?.id !== bookingData.customer_id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You can only create bookings for yourself",
                errors: "Insufficient permissions"
            });
        }

        // Validate dates
        const startDate = new Date(bookingData.rent_start_date);
        const endDate = new Date(bookingData.rent_end_date);

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "Invalid date range",
                errors: "End date must be after start date"
            });
        }

        // Check vehicle availability
        const isAvailable = await bookingServices.checkVehicleAvailability(bookingData.vehicle_id);

        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Vehicle is not available",
                errors: "This vehicle is currently booked"
            });
        }

        const booking = await bookingServices.createBooking(bookingData);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            errors: error.message
        });
    }
};

const getAllBookings = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;

        let bookings;
        let message;

        if (currentUser?.role === "admin") {
            // Admin sees all bookings
            bookings = await bookingServices.getAllBookings();
            message = "Bookings retrieved successfully";
        } else {
            // Customer sees only their own bookings
            bookings = await bookingServices.getBookingsByCustomer(currentUser?.id as number);
            message = "Your bookings retrieved successfully";
        }

        res.status(200).json({
            success: true,
            message,
            data: bookings
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings",
            errors: error.message
        });
    }
};

const updateBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId as string);
        const { status } = req.body;
        const currentUser = req.user;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
                errors: "Please provide a status to update"
            });
        }

        // Get booking details
        const booking = await bookingServices.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
                errors: "No booking exists with this ID"
            });
        }

        // Customer can only update their own bookings
        if (currentUser?.role === "customer" && currentUser?.id !== booking.customer_id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You can only update your own bookings",
                errors: "Insufficient permissions"
            });
        }

        // Customer can only cancel bookings before start date
        if (currentUser?.role === "customer" && status === "cancelled") {
            const today = new Date();
            const startDate = new Date(booking.rent_start_date);

            if (startDate <= today) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot cancel booking",
                    errors: "You can only cancel bookings before the start date"
                });
            }
        }

        // Only admin can mark as returned
        if (status === "returned" && currentUser?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Only admins can mark bookings as returned",
                errors: "Insufficient permissions"
            });
        }

        const updatedBooking = await bookingServices.updateBookingStatus(bookingId, status);

        let message = "Booking updated successfully";
        if (status === "cancelled") {
            message = "Booking cancelled successfully";
        } else if (status === "returned") {
            message = "Booking marked as returned. Vehicle is now available";
        }

        res.status(200).json({
            success: true,
            message,
            data: updatedBooking
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to update booking",
            errors: error.message
        });
    }
};

export const bookingController = {
    createBooking,
    getAllBookings,
    updateBooking
};