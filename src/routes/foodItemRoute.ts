import { Router } from 'express';
import { isOwner } from '../middleware/auth.js';
import { createFoodItemsValidator } from '../middleware/foodItemValidator.js';
import {
  createFoodItemsController,
  getFoodMenuController,
} from '../controllers/foodItemControllers.js';

const router = Router({ mergeParams: true });

router.post('/', isOwner, createFoodItemsValidator, createFoodItemsController);
router.get('/', isOwner, getFoodMenuController);

export default router;
