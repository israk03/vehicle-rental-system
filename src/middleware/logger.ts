import { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) =>{
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] - ${req.method} - ${req.path}`);
    next();
};

export default logger;