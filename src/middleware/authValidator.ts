import type { Request, Response, NextFunction } from 'express';
import zod from 'zod';
import { RegisterSchema } from '../zod_schema/authSchema.js';

export const registerValidator = (req: Request, _res: Response, next: NextFunction) => {
  type UserData = zod.infer<typeof RegisterSchema>;
  const userData: UserData = req.body;

  const result = RegisterSchema.safeParse(userData);

  if (!result.success) return next(result.error);
  req.body = result.data;

  return next();
};
