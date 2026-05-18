import type { Request, Response, NextFunction } from 'express';
import { createUserService } from '../services/authService.js';
import { successResponse } from '../utils/successResponse.js';
import type { IUser } from '../types/types.js';
import config from '../config/env.js';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: IUser = req.body;

        const { user, accessToken, refreshToken } = await createUserService(userData);
        res.cookie(
            'refresh_token', refreshToken, {
                httpOnly: true,
                secure: config.isProduction,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,                
            }
        )

        successResponse(res, 201, 'User created successfuly', { user, accessToken })

    } catch (error) {
        next(error)
    }
}