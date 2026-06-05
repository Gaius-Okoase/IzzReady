import type { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { FoodItemIdsSchema } from '../zod_schema/foodItemSchema.js';

export const createFoodItemsValidator = (req: Request, _res: Response, next: NextFunction) => {
  type FoodItemIds = z.infer<typeof FoodItemIdsSchema>;
  const data: FoodItemIds = req.body;

  const result = FoodItemIdsSchema.safeParse(data);

  if (!result.success) return next(result.error);

  req.body = data;

  return next();
};
