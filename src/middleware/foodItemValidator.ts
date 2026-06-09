import type { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { CustomFoodItemSchema, FoodItemDetailsSchema, FoodItemIdsSchema, FoodItemStatusSchema } from '../zod_schema/foodItemSchema.js';

export const createFoodItemsValidator = (req: Request, _res: Response, next: NextFunction) => {
  type FoodItemIds = z.infer<typeof FoodItemIdsSchema>;
  const data: FoodItemIds = req.body;

  const result = FoodItemIdsSchema.safeParse(data);

  if (!result.success) return next(result.error);

  req.body = result.data;

  return next();
};

export const createCustomFoodItemValidator = (req: Request, _res: Response, next: NextFunction) => {
  type CustomFoodItem = z.infer<typeof CustomFoodItemSchema>;

  const itemData: CustomFoodItem = req.body;

  const result = CustomFoodItemSchema.safeParse(itemData);

  if (!result.success) return next(result.error);
  
  req.body = result.data;

  return next();
}

export const updateFoodItemDetailValidator = (req: Request, _res: Response, next: NextFunction) => {
  type FoodItemDetails = z.infer<typeof FoodItemDetailsSchema>;
  
  const itemData: FoodItemDetails = req.body;

  const result = FoodItemDetailsSchema.safeParse(itemData);

  if (!result.success) return next(result.error);
  
  req.body = result.data;

  return next();
};

export const updateFoodItemStatusValidator = (req: Request, _res: Response, next: NextFunction) => {
  type FoodItemStatus = z.infer<typeof FoodItemStatusSchema>;

  const itemStatus: FoodItemStatus = req.body;

  const result = FoodItemStatusSchema.safeParse(itemStatus);

  if (!result.success) return next(result.error);

  req.body = result.data;
  
  return next();
};
