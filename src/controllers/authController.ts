import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import {
  createUserService,
  getUserService,
  loginService,
  logoutService,
  processGoogleCallbackService,
  tokenRotationService,
} from '../services/authService.js';
import { successResponse } from '../utils/responseHelper.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { IUser, LoginDetails } from '../types/types.js';
import config from '../config/env.js';

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body as IUser;

  const { user, accessToken, refreshToken } = await createUserService(userData);
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  successResponse(res, 201, 'User created successfuly', {
    user,
    accessToken,
  });
});

export const googleOAuthUrlController = asyncHandler((req: Request, res: Response) => {
  // Get the role and store it
  const { role } = req.query as { role: 'customer' | 'owner' };
  res.cookie('role', role, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });
  // Generate state
  const state = randomBytes(32).toString('base64url');
  // Save state in cookie
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });
  // Define query params
  const params = new URLSearchParams({
    client_id: config.clientId!,
    redirect_uri: config.redirectUri!,
    state,
    scope: 'openid email profile',
    response_type: 'code',
    access_type: 'offline',
  });
  // Build OAuth endpoint
  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  // Redirect user
  res.redirect(authorizationUrl);
});

export const processGoogleCallbackController = asyncHandler(async (req: Request, res: Response) => {
  const q: { state?: string; error?: string; code?: string } = req.query;
  const state = req.cookies.oauth_state as string;
  const role = req.cookies.role as 'customer' | 'owner';

  const { user, accessToken, refreshToken, statusCode, message } =
    await processGoogleCallbackService(q, state, role);

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  successResponse(res, statusCode, message, {
    user,
    accessToken,
  });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const userData: LoginDetails = req.body;

  const { user, accessToken, refreshToken } = await loginService(userData);

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  successResponse(res, 200, 'Log in successful.', { user, accessToken });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user.id;

  await logoutService(id);

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  successResponse(res, 200, 'Log out successful');
});

export const tokenRotationController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  const { newRefreshToken, newAccessToken } = await tokenRotationService(refreshToken);

  res.cookie('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
  successResponse(res, 200, 'Token refresh successful', { accessToken: newAccessToken });
});

export const getUserController = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user.id;

  const user = await getUserService(id);

  successResponse(res, 200, 'User profile retrieved', { user });
});
