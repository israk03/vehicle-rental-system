import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signUp = async (req: Request, res: Response)=>{
    try {
        const userData = req.body;

        // validate required fields
        if(!userData.name || !userData.email || !userData.password || !userData.phone || !userData.role){
            return res.status(400).json({
                success: false,
                message: "All fields are required.", 
                errors: "Missing required fields: name, email, password, phone, role"
            });
        }

        // validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(userData.email)){
            return res.status(400).json({
                success: false,
                message: "Invalid email formate.", 
                errors: "Please provide a valid email address."
            });
        }

        // validate password length
        if(userData.password.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long.", 
                errors: "Password validation failed."
            });
        }

        // validate role
        if(!['admin', 'customer'].includes(userData.role)){
            return res.status(400).json({
                success: false,
                message: "Invalid role",
                errors: "Role must be either 'admin' or 'customer'"
            });
        }

        const result = await authServices.registerUser(userData);

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: result
        })
        
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Registration failed.",
            errors: error.message
        });
    }
};

const signIn = async (req: Request, res: Response)=>{
    try {
        const {email, password} = req.body;

        // validate
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                errors: "Missing credentials."
            });
        }

        const result = await authServices.loginUser(email, password);

        if(result === null || result === false){
            return res.status(401).json({
                success: false,
                message: "User not found.",
                errors: "No account exists."
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        })


    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            errors: error.message
        });
    }
};

export const authController = {
    signUp,
    signIn
};