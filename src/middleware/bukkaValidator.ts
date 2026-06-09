import type { Request, Response, NextFunction } from 'express';
import zod from 'zod';
import { BukkaSetupSchema, CoordinatesSchemas } from '../zod_schema/bukkaSchema.js';

export const bukkaSetupValidator = async (req: Request, _res: Response, next: NextFunction) => {
  type BukkaData = zod.infer<typeof BukkaSetupSchema>;
  const bukkaData: BukkaData = req.body;

  const result = BukkaSetupSchema.safeParse(bukkaData);

  if (!result.success) return next(result.error);

  req.body = bukkaData;

  return next();
};

export const coordinatesValidator = async (req: Request, _res: Response, next: NextFunction) => {
  const coordinates = req.query;

  const result = CoordinatesSchemas.safeParse(coordinates);

  if (!result.success) return next(result.error);

  console.log(req.query);
  return next();
};
