import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { createUserService, processGoogleCallbackService } from '../services/authService.js';
import { successResponse } from '../utils/successResponse.js';
import type { IUser } from '../types/types.js';
import config from '../config/env.js';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: IUser = req.body;

    const { user, accessToken, refreshToken } = await createUserService(userData);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, 201, 'User created successfuly', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const googleOAuthUrlController = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the role and store it
    const { role } = req.query as {role: 'customer' | 'owner'};
      res.cookie('role', role, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000
    })
    // Generate state
    const state = randomBytes(32).toString('base64url');
    // Save state in cookie
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000
    })
    // Define query params
    const params = new URLSearchParams ({
      client_id: config.clientId!,
      redirect_uri: config.redirectUri!,
      state,
      scope: 'openid email profile',
      response_type: 'code',
      access_type: 'offline'
    })
    // Build OAuth endpoint
    const authorizationUrl =`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    // Redirect user
    res.redirect(authorizationUrl);
  } catch (error) {
    next(error)
  }
}

export const processGoogleCallbackController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q: {state?: string, error?: string, code?: string} = req.query;
    const state = req.cookies.oauth_state as string;
    const role = req.cookies.role as 'customer' | 'owner'

    const {
      user, 
      accessToken, 
      refreshToken,
      statusCode,
      message
    } = await processGoogleCallbackService(q, state, role);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, statusCode, message, {
      user,
      accessToken,
    });
  } catch (error) {
    next(error)
  }
}
