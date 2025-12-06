import express, { Request, Response } from "express";
import initDB from "./config/db";

const app = express();

// initialize database
initDB()

// check routs works
app.get("/", (req: Request, res: Response)=>{
    res.json({
        success: true,
        message: "Vehicle Rental System API is working."
    })
})

export default app;