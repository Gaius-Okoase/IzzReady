import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { MongooseError } from 'mongoose';
import config from '../config/env.js';

export const errorHandler: ErrorRequestHandler = async (
  error,
  _req,
  res,
  _next
) => {
  // Log errors in dev mode
  if(config.isDevelopment) console.log('❌ Error:', error.stack)

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
        timestamp: new Date().toISOString
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString
      });
    }
  } else {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString
    });
  }
};
