import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
declare global {
    namespace Express {
        interface UserPayLoad {
            id: number;
            email: string;
            role: string;
        }
        interface Request{
            user?: JwtPayload
        }
    }
}