import type { Request, Response, NextFunction } from 'express';
import zod from 'zod';
import { BukkaSetupSchema } from '../zod_schema/bukkaSchema.js';

export const bukkaSetupValidator = async (req: Request, _res: Response, next: NextFunction) => {
  type BukkaData = zod.infer<typeof BukkaSetupSchema>;
  const bukkaData: BukkaData = req.body;

  const result = BukkaSetupSchema.safeParse(bukkaData);

  if (!result.success) return next(result.error);

  req.body = bukkaData;

  return next();
};
