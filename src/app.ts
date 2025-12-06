import express, { Request, Response } from "express";
import initDB from "./config/db";
import logger from "./middleware/logger";

const app = express();

// middleware
app.use(express.json());
app.use(logger);

// initialize database
initDB()

// check routs works
app.get("/", (req: Request, res: Response)=>{
    res.json({
        success: true,
        message: "Vehicle Rental System API is working."
    })
})

// API routes



// 404 handler
app.use((req: Request, res: Response)=>{
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// global error handler
app.use((err: any, req: Request, res: Response, next: any)=>{
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error.",
    });
});

export default app;