import type { Request, Response, NextFunction } from "express";
import { createFoodItemsSchema } from "../zod_schema/foodItemSchema.js";

export const createFoodItemsValidator = (req: Request, _res: Response, next: NextFunction) => {
    const data = req.body;
    const result = createFoodItemsSchema.safeParse(data)

    if(!result.success) return result.error;

    req.body = data;
    
    return next();
}