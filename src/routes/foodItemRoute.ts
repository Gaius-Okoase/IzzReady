import { Router } from "express";
import { isOwner } from "../middleware/auth.js";
import { createFoodItemsValidator } from "../middleware/foodItemValidator.js";
import { createFoodItemsController } from "../controllers/foodItemControllers.js";

const router = Router();

router.post('/:id/food-items', isOwner, createFoodItemsValidator, createFoodItemsController);

export default router;