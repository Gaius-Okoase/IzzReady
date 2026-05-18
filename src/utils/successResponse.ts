import type {Response} from 'express';

export const successResponse = (res: Response, statusCode: number, data: object) => {
    res.status(statusCode).json({
        success: true,
        ...data
    })
}