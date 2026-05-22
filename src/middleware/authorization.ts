import type { Request, Response, NextFunction } from 'express';
import jwt from 'jwt';
import type { DecodedToken } from '../types/types.js';

export const authorization = async (req: Request, res: Response, next: NextFunction) => {};
