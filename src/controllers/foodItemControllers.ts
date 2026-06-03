import type { Request, Response } from "express";
import { createFoodItem } from "../services/foodItemService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/responseHelper.js";

export const createFoodItemsController = asyncHandler(async (req: Request, res: Response) => {
    const bukkaId = req.query.bukkaId as string;
    const { foodItemIds } = req.body as { foodItemIds: string[] };

    const result = await createFoodItem(bukkaId, foodItemIds);
    successResponse(res, 201, `${foodItemIds.length} has been added to yout bukka`, result);    
})