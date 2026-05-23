import type { Response } from 'express';

export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: object
) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
    timestamp: new Date().toISOString,
  });
};
