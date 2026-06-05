import type { Request, Response } from 'express';
import { createFoodItem, getFoodMenuItems } from '../services/foodItemService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/responseHelper.js';

export const createFoodItemsController = asyncHandler(async (req: Request, res: Response) => {
  const bukkaId = req.params.bukkaId as string;
  const { foodItemIds } = req.body as { foodItemIds: string[] };

  const result = await createFoodItem(bukkaId, foodItemIds);
  successResponse(
    res,
    201,
    `${result.upsertedCount} food item(s) has been added to your bukka.`,
    result
  );
});

export const getFoodMenuController = asyncHandler(async (req: Request, res: Response) => {
  const bukkaId = req.params.bukkaId as string;
  const foodItems = await getFoodMenuItems(bukkaId);
  const message =
    foodItems.length === 0
      ? 'Your menu is empty. Add food items.'
      : 'Food menu retreived successfully.';

  successResponse(res, 200, message, foodItems);
});
