import type { IUser } from '../types/types.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
//import type { QueryFilter } from 'mongoose';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

export const createUserService = async (userData: IUser) => {
  const { googleId, name, email, phoneNumber, password, role } = userData;

  // Check if user exists
  // const existingUserFilter: QueryFilter<IUser> = {
  //     $or: [
  //         ...(email ? [{ email }] : []),
  //         ...(phoneNumber ? [{ phoneNumber }] : [])
  //     ]
  // };
  const findExistingUser = async (email: string | undefined, phoneNumber: string | undefined) => {
    let user;
    if (phoneNumber) user = await User.findOne({ phoneNumber }).lean();
    if (email) user = await User.findOne({ email }).lean();
    console.log(user);
    return user;
  };
  const userExists = await findExistingUser(email, phoneNumber);
  console.log(userExists);
  if (userExists)
    throw new AppError(409, 'User already exists. Please log in or reset your password.');

  // Create new user
  const user = await User.create({
    googleId,
    name,
    email,
    phoneNumber,
    password,
    role,
  });

  // Generate tokens and save refresh token to DB
  let identifier;
  if (email) identifier = email;
  if (phoneNumber) identifier = phoneNumber;
  console.log(identifier);
  const refreshToken = generateRefreshToken(user.id, user.role, identifier!);
  const accessToken = generateAccessToken(user.id, user.role, identifier!);
  user.refreshToken = refreshToken;
  user.isProfileComplete = role === 'owner' ? false : true;
  //Save user to DB
  user.save();

  return { user, accessToken, refreshToken };
};
