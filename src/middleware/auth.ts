import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express"
import config from "../config";

const auth = (...roles: string[])=>{
    return async (req: Request, res: Response, next: NextFunction) =>{
        try {
            const authHeader = req.headers.authorization;

            if(!authHeader || !authHeader.startsWith("Bearer ")){
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized - No token provided"
                });
            }

            const token = authHeader.split(" ")[1];

            const secret = config.jwt_secret as string;

            const decoded = jwt.verify(token as string, secret) as JwtPayload;

            req.user = decoded;

            // check role authorization
            if(roles.length && !roles.includes(decoded.role)){
                return res.status(403).json({
                    success: false,
                    message: "Forbidden"
                })
            }


            next();
            
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token."
            });
            
        }
    };
};

export default auth;