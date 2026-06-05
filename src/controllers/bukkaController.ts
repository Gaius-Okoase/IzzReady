import type { Request, Response } from 'express';
import { successResponse } from '../utils/responseHelper.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { IBukka, IUpdateBukka } from '../types/types.js';
// import config from '../config/env.js';
import {
  createBukkaService,
  deleteBukka,
  getOwnerBukkas,
  getBukkaDetails,
  updateBukkaDetails,
} from '../services/bukkaService.js';

export const createBukkaController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, location } = req.body as IBukka;
  const bukkaData = { name, location };
  const bukka = await createBukkaService(userId, bukkaData);

  successResponse(res, 201, 'Bukka created successfully.', bukka);
});

export const getOwnerBukkasController = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user.id;
  const bukkas = await getOwnerBukkas(ownerId);

  successResponse(res, 200, "Owner's bukka(s) retrieved successfully.", bukkas);
});

export const getBukkaDetailsController = asyncHandler(async (req: Request, res: Response) => {
  const bukkaId = req.params.bukkaId as string;

  const bukka = await getBukkaDetails(bukkaId);

  successResponse(res, 200, 'Bukka details retreived.', bukka);
});

export const updateBukkaDetailsController = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user.id as string;
  const bukkaId = req.params.bukkaId as string;
  const bukkaData = req.body as IUpdateBukka;

  const bukka = await updateBukkaDetails(ownerId, bukkaId, bukkaData);

  successResponse(res, 200, 'Bukka details update successfull.', bukka);
});

export const deleteBukkaController = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user.id as string;
  const bukkaId = req.params.bukkaId as string;

  await deleteBukka(ownerId, bukkaId);

  successResponse(res, 200, 'Bukka deletion successful.');
});
