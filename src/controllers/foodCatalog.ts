import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/responseHelper.js';
import { getFoodCatalog } from '../services/foodCatalogService.js';

export const getFoodCatalogController = asyncHandler(async (_req: Request, res: Response) => {
  const foodCatalog = await getFoodCatalog();

  successResponse(res, 200, 'Food Catalog retrieved successfully.', foodCatalog);
});
