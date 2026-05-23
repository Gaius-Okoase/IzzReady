import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { DecodedToken } from '../types/types.js';
import config from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const authorization = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Get authorization object
        const authorization = req.headers.authorization;

        if (!authorization) throw new AppError(401, 'Unauthorized. Invalid or missing token.')

        // Confirm authorization is Bearer token
        if(!authorization?.startsWith('Bearer ')) throw new AppError(401, 'Unauthorized. Invalid or missing token.');

        // Extract token
        const token = authorization?.split(" ")[1];

        if(!token) throw new AppError(401, 'Unauthorized. Invalid or missing token.');

        // Decode token and attach to request object
        const decodedToken = jwt.verify(token, config.accessSec!) as DecodedToken;

        // Verify user exists and account is active
        const userExists = await User.findById(decodedToken.id).lean();
   
        if (!userExists) throw new AppError(410, 'User does not exist');
        if (userExists.isActive !== true) throw new AppError(403, 'Forbidden.');

        // Pass deoded token paylaad to request object   
        const user = {
            id: decodedToken.id,
            role: decodedToken.role,
            identifier: decodedToken.identifier
        }
        req.user = user;
    } catch (error) {
        next(error);  
    }
    return next();
};