import type { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/responseHelper.js';
import type { IBukka } from '../types/types.js';
// import config from '../config/env.js';
import { bukkaSetupService } from '../services/bukkaService.js';

export const bukkaSetupController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { name, location } = req.body as IBukka;
    const bukkaData = { name, location };
    const bukka = await bukkaSetupService(userId, bukkaData);

    successResponse(res, 201, 'Bukka created successfully.', {bukka});
  } catch (error) {
    next(error);
  }
};
