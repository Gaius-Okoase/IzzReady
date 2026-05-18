import type { IUser } from '../types/types.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import type { QueryFilter } from 'mongoose';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

export const createUserService = async (userData: IUser) => {
    const { googleId, name, email, phoneNumber, password, role } = userData;

    // Check if user exists
    const existingUserFilter: QueryFilter<IUser> = {
        $or: [
            { email: email as string },
            { phoneNumber: phoneNumber as string }
        ]
    };
    const userExists = await User.findOne(existingUserFilter);
    if (userExists) throw new AppError(409, "User already exists. Please log in or reset your password.");

    // Create new user
    const user = await User.create({googleId, name, email, phoneNumber, password, role})

    // Generate tokens and save refresh token to disablek
    const refreshToken = generateRefreshToken(user.id, user.role);
    const accessToken = generateAccessToken(user.id, user.role);
    user.refreshToken = refreshToken;

    //Save user to DB
    user.save();

    return{ user, accessToken }
}
