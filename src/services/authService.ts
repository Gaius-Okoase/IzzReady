import axios from 'axios';
import jwt from 'jsonwebtoken';
import type { DecodedToken, IUser, LoginDetails } from '../types/types.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import config from '../config/env.js';

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
    return user;
  };
  const userExists = await findExistingUser(email, phoneNumber);
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
  const identifier = email ?? phoneNumber;
  if (!identifier) throw new AppError(400, 'Missing identifier for token generation.');
  const refreshToken = generateRefreshToken(user.id, user.role, identifier);
  const accessToken = generateAccessToken(user.id, user.role, identifier);
  user.refreshToken = refreshToken;
  user.isProfileComplete = role === 'owner' ? false : true;
  //Save user to DB
  await user.save();

  return { user, accessToken, refreshToken };
};

export const processGoogleCallbackService = async (
  q: { state?: string; error?: string; code?: string },
  state: string,
  role: 'customer' | 'owner'
) => {
  // Handle google error
  if (q.error) throw new Error('Something went wrong. Please try again.');
  // Handle state mismatch
  if (q.state !== state) throw new Error('State mismatch. Possible CSRF attack.');

  // Generate token payload
  const tokenPayload = {
    client_id: config.clientId,
    client_secret: config.clientSec,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code: q.code,
  };

  //Get access token from google token endpoint
  const token = await axios.post<{
    access_token: string;
    scope: string;
    token_type: 'Bearer';
  }>('https://oauth2.googleapis.com/token', tokenPayload, {
    headers: { Accept: 'application/json' },
  });
  const access_token = token.data.access_token;

  // Get user data with access token
  const user = await axios.get<{
    name: string;
    email: string;
    sub: string;
  }>('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  // Check if user exists
  const userExists = await User.findOne({ email: user.data.email });
  if (userExists) {
    // Check if user's account is active
    if (userExists.isActive !== true) throw new AppError(403, 'Forbidden');
    
    // Generate tokens
    const id = userExists.id;
    const role = userExists.role;
    const email = userExists.email as string;
    const refreshToken = generateRefreshToken(id, role, email);
    const accessToken = generateAccessToken(id, role, email);
    userExists.refreshToken = refreshToken;
    userExists.lastLoginAt = new Date();
    await userExists.save();

    // Send success status code and message
    const statusCode = 200;
    const message = 'Sign in successful';
    return {
      user: userExists,
      accessToken,
      refreshToken,
      statusCode,
      message,
    };
  } else {
    // Generate user data for izzReady app
    const userData = {
      name: user.data.name,
      email: user.data.email,
      googleId: user.data.sub,
      role,
    };
    // Create new user
    const newUser = await createUserService(userData);

    // Success status code and message
    const message = 'User created successfully';
    const statusCode = 201;

    return {
      user: newUser.user,
      refreshToken: newUser.refreshToken,
      accessToken: newUser.accessToken,
      message,
      statusCode,
    };
  }
};

export const loginService = async (userData: LoginDetails) => {
  // Destructure
  const { phoneNumber, password } = userData;

  // Find user document
  const user = await User.findOne({ phoneNumber }).select('+password');
  if (!user) throw new AppError(401, 'Incorrect phone number or password');

  // Check if user's account is active
  if (user.isActive !== true) throw new AppError(403, 'Forbidden');

  // Check if password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError(401, 'Incorrect phone number or password');

  // Generate tokens and save to db
  const refreshToken = generateRefreshToken(user.id, user.role, user.phoneNumber as string);
  const accessToken = generateAccessToken(user.id, user.role, user.phoneNumber as string);
  user.lastLoginAt = new Date();
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user,
    refreshToken,
    accessToken,
  };
};

export const logoutService = async (id: string) => {
  //Get user's document
  const user = await User.findByIdAndUpdate(
    id,
    { refreshToken: null },
    { returnDocument: 'after' }
  );

  return user;
};

export const tokenRotationService = async (refreshToken: string) => {
  try {
    const { id, role, identifier }= jwt.verify(refreshToken, config.refreshSec!) as DecodedToken

    const user = await User.findOne({ refreshToken });

    // Handle wrong refresh token
    if (!user) {
      await User.findByIdAndUpdate(id, { refreshToken: null }); //Ask about isActive
      throw new AppError(403, 'Invalid or expired token. Please log in again.');
    }

    // Generate refresh token
    const newRefreshToken = generateRefreshToken(id, role, identifier);
    const newAccessToken = generateAccessToken(id, role, identifier);

    // Save token to db
    user.refreshToken = newRefreshToken;
    await user.save();

    return { newRefreshToken, newAccessToken };
  } catch (error) {
    if(config.isDevelopment) console.log(error)
    throw new AppError(500, 'Something went wrong. Please log in again.');
  }
};

export const getUserService = async (id: string) => {
  const user = await User.findById(id);

  if (!user) throw new AppError(404, 'User not found');

  return user;
};
