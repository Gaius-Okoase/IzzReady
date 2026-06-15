import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/responseHelper.js';
import { savePushNotif } from '../services/notificationService.js';
import type { PushNotifToken } from '../types/types.js';

export const savePushNotifController = asyncHandler(async (req: Request, res: Response) => {
  const push: PushNotifToken = req.body;
  const userId = req.user.id;

  await savePushNotif(userId, push);

  successResponse(res, 200, 'Push notification token saved.');
});
