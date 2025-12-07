import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

//!------------------CREATE VEHICLE
const createVehicle = async(req: Request, res: Response)=>{
    try {
        const vehicleData = req.body;

    // validate required field
    const requiredFields = ['vehicle_name', 'type', 'registration_number', 'daily_rent_price', 'availability_status'];

    for(const field of requiredFields){
        if(!vehicleData[field]){
            return res.status(400).json({
                success: false,
                message: `Missing required field: ${field}`,
                errors: "All vehicle fields are required"
            });
        }
    }

    // validate type
    const validTypes = ['car', 'bike', 'van', 'suv'];
    if(!validTypes.includes(vehicleData.type)){
        return res.status(400).json({
            success: false,
            message: "Invalid vehicle type",
            errors: "Type must be one of: car, bike, van, suv"
        });
    }

    // validate status
    const validStatuses = ['available', 'booked'];
    if(!validStatuses.includes(vehicleData.availability_status)){
        return res.status(400).json({
            success: false,
            message: "Invalid availability status",
            errors: "Status must be either 'available' or 'booked'"
        });
    }

    // validate rent price
    if(vehicleData.daily_rent_price <= 0){
        return res.status(400).json({
            success: false,
            message: "Invalid daily rent price",
            errors: "Daily rent price must be greater than 0"
        });
    }

    const vehicle = await vehicleService.createVehicle(vehicleData);

    res.status(201).json({
        success: true,
        message: "Vehicle create successfully",
        data: vehicle
    });



    } catch (error: any){
        res.status(500).json({
            success: false,
            message: "Failed to create vehicle",
            errors: error.message
        });
    }
        

};

//!-----------------GET ALL VEHICLES
const getAllVehicles = async(req: Request, res: Response)=>{
    try {
        const vehicles = await vehicleService.getAllVehicles();

        if(vehicles.length === 0){
            return res.status(500).json({
                success: false,
                message: "No vehicles found",
                data: []
            })
        }

        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles
        })
        
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve vehicles",
            errors: error.message
        })
    }
}

//!-----------GET SINGLE VEHICLE
const getVehicleById = async(req: Request, res: Response)=>{
    try {
        const vehicleId = parseInt(req.params.vehicleId as string);

        const vehicle = await vehicleService.getVehicleById(vehicleId);
        if(!vehicle){
            return res.status(404).json({
                success: false,
                message: "Vehicle not found", 
                errors: "No vehicle exists with this id."
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully.",
            data: vehicle
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve vehicle",
            errors: error.message
        });
    }
};

//!-----------UPDATE SINGLE VEHICLE
const updateVehicle = async(req: Request, res: Response)=>{
    try {
        const vehicleId = parseInt(req.params.vehicleId as string);
    const updateData = req.body;

    // Validate type if provided
        if (updateData.type) {
            const validTypes = ['car', 'bike', 'van', 'SUV'];
            if (!validTypes.includes(updateData.type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vehicle type",
                    errors: "Type must be one of: car, bike, van, SUV"
                });
            }
        }

    // Validate availability_status if provided
        if (updateData.availability_status) {
            const validStatuses = ['available', 'booked'];
            if (!validStatuses.includes(updateData.availability_status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid availability status",
                    errors: "Status must be either 'available' or 'booked'"
                });
            }
        }

    // Validate daily_rent_price if provided
        if (updateData.daily_rent_price && updateData.daily_rent_price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid daily rent price",
                errors: "Daily rent price must be greater than 0"
            });
        }

    const updatedVehicle = await vehicleService.updateVehicle(vehicleId, updateData)

    if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "No vehicle exists with this ID"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: updatedVehicle
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to update vehicle",
            errors: error.message
        });
    }
}

//!-----------DELETE VEHICLE
const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleId = parseInt(req.params.vehicleId as string);

        // Check for active bookings
        const hasActiveBookings = await vehicleService.hasActiveBookings(vehicleId);

        if (hasActiveBookings) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete vehicle with active bookings",
                errors: "Vehicle has active bookings. Complete or cancel them first."
            });
        }

        const deleted = await vehicleService.deleteVehicle(vehicleId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "No vehicle exists with this ID"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle",
            errors: error.message
        });
    }
};

export const vehicleController = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
}