import type { Request, Response } from 'express';
import { createFoodItem, getFoodMenuItems, updateFoodItem, deleteFoodItem, createCustomFoodItem } from '../services/foodItemService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/responseHelper.js';
import type { ICustomFoodItem, IUpdateFoodItem } from '../types/types.js';

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

export const createCustomFoodItemController = asyncHandler(async (req: Request, res: Response) => {
  const bukkaId = req.params.bukkaId as string;
  const itemData: ICustomFoodItem = req.body;

  const item = await createCustomFoodItem(bukkaId, itemData);

  successResponse(res, 201, 'Custom food item created successfully.', item);
})

export const updateFoodItemController = asyncHandler(async (req: Request, res: Response) => {
  const itemData: IUpdateFoodItem = req.body;
  const itemId = req.params.itemId as string;
  const bukkaId = req.params.bukkaId as string;

  const result = await updateFoodItem(bukkaId, itemId, itemData);
  successResponse(res, 200, 'Food item update successful.', result);
});

export const deleteFoodItemController = asyncHandler(async (req: Request, res: Response) => {
  const itemId = req.params.itemId as string;
  const bukkaId = req.params.bukkaId as string;

  await deleteFoodItem(bukkaId, itemId);
  successResponse(res, 200, 'Food item deletion successful.');
});