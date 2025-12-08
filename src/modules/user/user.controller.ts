import { Request as ExpressRequest, Response } from "express";
import { userServices } from "./user.service";
import { JwtPayload } from 'jsonwebtoken';

// Extend Request locally
interface Request extends ExpressRequest {
  user?: JwtPayload & {
    id: number;
    email: string;
    role: string;
  };
}

//!----------------------GET ALL USERS
const getAllUsers = async(req: Request, res: Response)=>{
    try {
        const user = await userServices.getAllUsers();

        res.status(200).json({
            success: true, 
            message: "User retrieved successfully.",
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve user."
        });
        
    }
};

//!----------------------UPDATE USER
const updateUser = async(req: Request, res: Response)=>{
    try {
        const userId = parseInt(req.params.userId as string);
        const updateData = req.body;
        const currentUser = req.user;

        // check if customer trying to update someone else's profile
        if(currentUser?.role === "customer" && currentUser?.id !== userId){
            return res.status(403).json({
                success: false,
                message: "Forbidden - You can only update your own profile",
                errors: "Insufficient permissions"
            });
        }

        // only admin's can update roles
        if(updateData.role && currentUser?.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden - Only admins can update user roles",
                errors: "Insufficient permissions"
            });
        }

        const updatedUser = await userServices.updateUser(userId, updateData);

        if(!updateData){
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "No user exists with this ID"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });

        
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to update user.", 
            errors: error.message
        });
    }
}

//!----------------------DELETE USER
const deleteUser = async(req: Request, res: Response)=>{
    try {
        const userId = parseInt(req.params.userId as string);

        // check for active bookings
        const hasActiveBookings = await userServices.hasActiveBookings(userId);

        if(hasActiveBookings){
            return res.status(400).json({
                success: false,
                message: "Cannot delete user with active bookings",
                errors: "User has active bookings. Complete or cancel them first."
            });
        }

        // delete user
        const deleted = await userServices.deleteUser(userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "No user exists with this ID"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });


    } catch (error: any) {
         res.status(500).json({
            success: false,
            message: "Failed to delete user",
            errors: error.message
        });
    }
}



export const userController = {
    getAllUsers,
    updateUser, 
    deleteUser
};