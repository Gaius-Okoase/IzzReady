import type { Request, Response } from 'express';
import { successResponse } from '../utils/responseHelper.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { IBukka } from '../types/types.js';
// import config from '../config/env.js';
import { createBukkaService, getOwnerBukkas } from '../services/bukkaService.js';

export const createBukkaController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, location } = req.body as IBukka;
  const bukkaData = { name, location };
  const bukka = await createBukkaService(userId, bukkaData);

  successResponse(res, 201, 'Bukka created successfully.', bukka);
});

export const getOwnerBukkasController = asyncHandler( async (req: Request, res: Response) => {
  const ownerId = req.user.id;
  const bukkas = await getOwnerBukkas(ownerId);
  successResponse(res, 200, 'Owner\'s bukka(s) retrieved successfully.', bukkas);
})