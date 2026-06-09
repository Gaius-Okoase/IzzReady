import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/responseHelper.js";
import { joinQueue, leaveQueue, getQueCount } from "../services/queueService.js";

export const joinQueueController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id as string;
    const itemId = req.params.itemId as string;

    const queue = await joinQueue(userId, itemId);

    successResponse(res, 201, 'You have successfully joined the queue.', queue);
});

export const leaveQueueController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const itemId = req.params.itemId as string;  

  await leaveQueue(userId, itemId);

  successResponse(res, 200, 'You have successfully left the queue.')
});

export const getQueCountController = asyncHandler(async (req: Request, res: Response) => {
    const itemId = req.params.itemId as string;

    const count = await getQueCount(itemId);

    successResponse(res, 200, `Queue count retrieved`, count);
})