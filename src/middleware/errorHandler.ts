import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { MongooseError } from 'mongoose';

export const errorHandler: ErrorRequestHandler = async (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  } else if (error instanceof MongooseError) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  } else {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
